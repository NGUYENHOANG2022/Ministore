import { FaSolidTrash } from "solid-icons/fa";
import { Accessor, Component, createResource, createSignal, For, onCleanup, ResourceFetcher, Setter, } from "solid-js";
import { DataResponse, Role, ScheduleTemplate, Shift } from "~/types";
import { ScheduleTemplateModalState, useSPData } from "~/context/ShiftPlanning";
import { shiftDetailsTime } from "../utils/shiftTimes";
import { roles } from "~/utils/roles";
import ResourceWrapper from "~/components/ResourceWrapper";
import SidePopupModal from "~/components/SidePopupModal";
import axios from "axios";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { getWeekDateStings } from "~/utils/getWeekDates";
import isDayInThePast from "~/utils/isDayInThePast";
import { toastSuccess } from "~/utils/toast";
import getSameWeekDay from "~/utils/getSameWeekDay";
import moment from "moment";

interface DetailsProps {
  setModalState: Setter<ScheduleTemplateModalState>;
  scheduleTemplateFocus: Accessor<ScheduleTemplate | undefined>;
  setScheduleTemplateFocus: Setter<ScheduleTemplate | undefined>;
}

const fetcher: ResourceFetcher<
  number,
  ScheduleTemplate,
  { state: ScheduleTemplateModalState }
> = async (id) => {
  try {
    const { data: staffs } = await axios
      .get<DataResponse<ScheduleTemplate>>(`${getEndPoint()}/schedule-templates/list/${id}`);

    return staffs.content;
  } catch (e) {
    throw new Error(handleFetchError(e));
  }
};

const Apply: Component<DetailsProps> = ({ setModalState, scheduleTemplateFocus, setScheduleTemplateFocus }) => {
  const [ scheduleTemplate ] = createResource(() => scheduleTemplateFocus()?.scheduleTemplateId, fetcher);
  const [ applying, setApplying ] = createSignal(false);
  const [ deleting, setDeleting ] = createSignal(false);
  const { pickedDate: curPickedDate, saveChanges } = useSPData();

  onCleanup(() => {
    setScheduleTemplateFocus(undefined);
  });

  const onDelete = async () => {
    if (applying() || deleting() || scheduleTemplate.error || scheduleTemplate() === undefined) return;

    try {
      if (curPickedDate() === undefined) throw new Error("No date picked");

      setDeleting(true);

      const response = await axios
        .delete<DataResponse<Shift[]>>(`${getEndPoint()}/schedule-templates/delete/${scheduleTemplate()!.scheduleTemplateId}`);

      if (!response.data) throw new Error("Invalid response from server");

      toastSuccess("Week template was deleted successfully");
      saveChanges();
      setModalState("list");
    } catch (error: any) {
      handleFetchError(error);
    } finally {
      setDeleting(false);
    }
  };

  const submit = async () => {
    if (applying() || deleting() || scheduleTemplate.error || scheduleTemplate() === undefined) return;

    try {
      if (curPickedDate() === undefined) throw new Error("No date picked");

      const shifts: Shift[] = scheduleTemplate()!.scheduleShiftTemplates.map((st) => {
        return {
          date: getSameWeekDay(st.date, moment(curPickedDate()).format("YYYY-MM-DD")),
          staffId: st.staffId,
          published: false,
          startTime: st.startTime,
          endTime: st.endTime,
          name: st.name,
          salaryCoefficient: st.salaryCoefficient,
          role: st.role
        } as Shift;
      })
        // only apply shifts that are not in the past
        .filter(s => !isDayInThePast(s.date));

      if (getWeekDateStings(curPickedDate()!).some(d => isDayInThePast(d))) {
        const confirm = window.confirm("The current chosen week has some past days. Only days that are not in the past will create shifts. Continue?");
        if (!confirm) return;
      }

      // alert(JSON.stringify(shifts));
      setApplying(true);

      const response = await axios.post<DataResponse<Shift[]>>(`${getEndPoint()}/shifts/add/multiple`, shifts);

      if (!response.data) throw new Error("Invalid response from server");

      toastSuccess("Shifts are applied successfully");
      saveChanges();
      setModalState(undefined);
    } catch (error: any) {
      handleFetchError(error);
    } finally {
      setApplying(false);
    }
  };

  return (
    <ResourceWrapper data={scheduleTemplate}>
      <SidePopupModal.Body classList={{ "cursor-progress": applying() || deleting() }}>
        <div class="flex py-2.5 overflow-hidden rounded bg-[#ceefff] px-2.5 -mx-2.5">
          <div class="flex-1 flex items-center">
            <div class="text-gray-700 font-semibold tracking-wide">
              {scheduleTemplate()!.name}
            </div>
            {/*<div class="text-gray-500 tracking-wide text-sm">*/}
            {/*  {displayDate(scheduleTemplate()!.createdAt)}*/}
            {/*</div>*/}
          </div>
          <div class="ml-3.5 flex items-start">
            <div
              class="text-[#00a8ff] bg-[#ceefff] text-xs font-semibold capitalize rounded-full aspect-square w-7 flex justify-center items-center border-2 border-white">
              {scheduleTemplate()!.numOfShifts}
            </div>
          </div>
        </div>
        <div
          class="text-[#637286] bg-[#f8fafc] font-semibold py-2.5 px-5 border-y border-[#d5dce6] -mx-5 mt-5 mb-3.5 text-sm">
          Preview Shifts
        </div>
        <div class="text-sm mb-4 text-gray-400 leading-[1.5] tracking-wide">
          This template has{" "}
          <span class="font-bold">
            {scheduleTemplate()?.numOfShifts} Shifts
          </span>{" "}
          that match the filters you have set. These shifts will be duplicated
          to this week when you apply this template:
        </div>
        <For each={scheduleTemplate()!.scheduleShiftTemplates}>
          {(shift) => (
            <div
              class="rounded mx-1 p-2 relative text-left mb-1"
              classList={{
                "bg-[repeating-linear-gradient(-45deg,white,white_5px,#eaf0f6_5px,#eaf0f6_10px)]":
                  true,
              }}
            >
              <i
                class="absolute top-1.5 left-1.5 bottom-1.5 w-1.5 rounded"
                classList={{
                  "bg-blue-500": shift.role === Role.CASHIER,
                  "bg-yellow-500": shift.role === Role.GUARD,
                  "bg-red-500": shift.role === Role.MANAGER,
                  "bg-gray-600": shift.role === Role.ADMIN,
                  "bg-gray-400": shift.role === Role.ALL_ROLES,
                }}
              ></i>
              <p class="ml-3.5 font-semibold text-sm tracking-wider">
                {shiftDetailsTime(
                  shift.date || "",
                  shift.startTime || "",
                  shift.endTime || ""
                )}
              </p>
              <p class="ml-3.5 font-normal text-xs text-[13px] tracking-wider">
                {shift.staffName || "No staff assigned"} •{" "}
                {roles.find((r) => r.value === shift.role)?.label}
              </p>
            </div>
          )}
        </For>
      </SidePopupModal.Body>
      <SidePopupModal.Footer>
        <div class="w-full flex justify-between items-center gap-3">
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting() || applying() || scheduleTemplate.error || scheduleTemplate() === undefined}
            class="flex gap-2 justify-center items-center text-gray-500 text-sm hover:text-gray-700 tracking-wide"
          >
            <span>
              <FaSolidTrash/>
            </span>
            <span>Delete</span>
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={deleting() || applying() || scheduleTemplate.error || scheduleTemplate() === undefined}
            class="py-1.5 px-3 font-semibold text-white border border-blue-400 bg-[#00a8ff] text-sm rounded hover:bg-blue-400"
          >
            Apply Template - {scheduleTemplate()?.numOfShifts} Shifts
          </button>
        </div>
      </SidePopupModal.Footer>
    </ResourceWrapper>
  );
};

export default Apply;
