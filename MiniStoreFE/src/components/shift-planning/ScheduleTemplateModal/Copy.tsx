import { flatten } from "lodash";
import {
  Accessor,
  batch,
  Component,
  createResource,
  createSignal,
  ErrorBoundary,
  For,
  onCleanup,
  onMount,
  ResourceFetcher,
  Setter,
  Suspense,
} from "solid-js";
import ResourceWrapper from "~/components/ResourceWrapper";
import SidePopupModal from "~/components/SidePopupModal";
import { ScheduleTemplateModalState, useSPData } from "~/context/ShiftPlanning";
import { DataResponse, Role, Shift, Staff } from "~/types";
import { shiftDetailsTime } from "../utils/shiftTimes";
import { roles } from "~/utils/roles";

import moment from "moment";
import {
  getWeekDateStings,
  getWeekFirstAndLastDates,
} from "~/utils/getWeekDates";
import { transformData } from "../utils/dataTransformer";
import { DataTable } from "../utils/types";
import getEndPoint from "~/utils/getEndPoint";
import axios from "axios";
import handleFetchError from "~/utils/handleFetchError";
import Spinner from "~/components/Spinner";
import { toastSuccess } from "~/utils/toast";
import getSameWeekDay from "~/utils/getSameWeekDay";
import isDayInThePast from "~/utils/isDayInThePast";
import { Instance } from "flatpickr/dist/types/instance";

interface CopyProps {
  modalState: Accessor<ScheduleTemplateModalState>;
  setModalState: Setter<ScheduleTemplateModalState>;
}

const fetcher: ResourceFetcher<
  string | undefined,
  DataTable,
  { state: ScheduleTemplateModalState }
> = async (source) => {
  try {
    const dates = getWeekDateStings(source as string);
    const from = dates[0];
    const to = dates[dates.length - 1];

    const { data: staffs } = await axios.get<DataResponse<Staff[]>>(
      `${getEndPoint()}/shift-planning?from=${from}&to=${to}`
    );

    return transformData({ dates, staffs: staffs.content, holidays: [] });
  } catch (e) {
    throw new Error(handleFetchError(e));
  }
};

const Copy: Component<CopyProps> = ({ setModalState }) => {
  const { pickedDate: curPickedDate, saveChanges } = useSPData();
  const [datePicked, setDatePicked] = createSignal<string | undefined>();
  const [dateStr, setDateStr] = createSignal<string>("");
  const [coping, setCoping] = createSignal<boolean>(false);
  const [data] = createResource(datePicked, fetcher);
  let dateRef: HTMLInputElement | undefined = undefined;
  let fp: Instance | undefined = undefined;

  const shiftIds = () =>
    !data.error && data() ? flatten(Object.values(data()!.cells)) : [];

  onMount(() => {
    const defaultDate = moment(curPickedDate())
      .subtract(7, "days")
      .format("YYYY-MM-DD");
    setDatePicked(defaultDate);

    // @ts-ignore
    fp = flatpickr(dateRef!, {
      mode: "single",
      dateFormat: "Y-m-d",
      defaultDate,
      onChange: updateDateStr,
      onReady: updateDateStr,
    });
  });

  onCleanup(() => {
    fp?.destroy();
  });

  const updateDateStr = (
    selectedDates: Date[],
    dateStr: string,
    instance: Instance
  ) => {
    if (selectedDates.length === 0) {
      batch(() => {
        setDatePicked(undefined);
        setDateStr("");
      });
    }
    if (selectedDates.length === 1) {
      const pickedDate = dateStr;
      const [from, to] = getWeekFirstAndLastDates(pickedDate);
      const start = instance.formatDate(from.toDate(), "F j");
      const end = instance.formatDate(to.toDate(), "F j, Y");
      // console.log(pickedDate);
      batch(() => {
        setDatePicked(pickedDate);
        setDateStr(`${start} - ${end}`);
      });
    }
  };

  const submit = async () => {
    if (coping()) return;

    try {
      const shifts: Shift[] = shiftIds()
        .map((id) => {
          return {
            ...data()!.shifts[id],
            date: getSameWeekDay(
              data()!.shifts[id].date,
              moment(curPickedDate()).format("YYYY-MM-DD")
            ),
          } as Shift;
        })
        // only copy shifts that are not in the past
        .filter((s) => !isDayInThePast(s.date));

      if (curPickedDate() === undefined) throw new Error("No date picked");

      if (getWeekDateStings(curPickedDate()!).some((d) => isDayInThePast(d))) {
        const confirm = window.confirm(
          "The current chosen week has some past days. Only days that are not in the past will create shifts. Continue?"
        );
        if (!confirm) return;
      }

      // alert(JSON.stringify(shifts));
      setCoping(true);

      const response = await axios.post<DataResponse<Shift[]>>(
        `${getEndPoint()}/shifts/add/multiple`,
        shifts
      );

      if (!response.data) throw new Error("Invalid response from server");

      toastSuccess("Shifts are created successfully");
      saveChanges();
      setModalState(undefined);
    } catch (error: any) {
      handleFetchError(error);
    } finally {
      setCoping(false);
    }
  };

  return (
    <Suspense
      fallback={
        <div class="h-full w-full grid place-items-center">
          <Spinner />
        </div>
      }
    >
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <SidePopupModal.Body classList={{ "cursor-progress": coping() }}>
          <div class="text-sm mb-2">
            <label class="inline-block mb-1.5 text-gray-600 font-semibold">
              Week to Copy
            </label>
            <button
              ref={dateRef}
              type="button"
              class="range_flatpicker shadow-inner w-full px-4 py-2 text-left text-gray-600 border rounded outline-none focus:border-indigo-500 focus:shadow"
            >
              {dateStr() || "Select Dates"}
            </button>
          </div>
          <div class="text-sm mb-4 text-gray-400 leading-[1.5] tracking-wide">
            The week you want to copy to this week.
          </div>
          <div class="text-[#637286] bg-[#f8fafc] font-semibold py-2.5 px-5 border-y border-[#d5dce6] -mx-5 mt-5 mb-3.5 text-sm">
            Targeted Shifts
          </div>
          <ResourceWrapper data={data}>
            <div class="text-sm mb-4 text-gray-400 leading-[1.5] tracking-wide">
              You are targeting{" "}
              <span class="font-bold">{shiftIds().length} Shifts</span> with the
              filters you have set:
            </div>
            <For each={shiftIds()}>
              {(shiftId) => (
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
                      "bg-blue-500":
                        data()!.shifts[shiftId].role === Role.CASHIER,
                      "bg-yellow-500":
                        data()!.shifts[shiftId].role === Role.GUARD,
                      "bg-red-500":
                        data()!.shifts[shiftId].role === Role.MANAGER,
                      "bg-gray-600":
                        data()!.shifts[shiftId].role === Role.ADMIN,
                      "bg-gray-400":
                        data()!.shifts[shiftId].role === Role.ALL_ROLES,
                    }}
                  ></i>
                  <p class="ml-3.5 font-semibold text-sm tracking-wider">
                    {shiftDetailsTime(
                      data()!.shifts[shiftId].date || "",
                      data()!.shifts[shiftId].startTime || "",
                      data()!.shifts[shiftId].endTime || ""
                    )}
                  </p>
                  <p class="ml-3.5 font-normal text-xs text-[13px] tracking-wider">
                    {data()!.staffs.find(
                      (s) => s.staffId === data()!.shifts[shiftId].staffId
                    )!.staffName || "No staff assigned"}{" "}
                    •{" "}
                    {
                      roles.find(
                        (r) => r.value === data()!.shifts[shiftId].role
                      )?.label
                    }
                  </p>
                </div>
              )}
            </For>
          </ResourceWrapper>
        </SidePopupModal.Body>
        <SidePopupModal.Footer>
          <div class="w-full flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={dateStr() === "" || shiftIds().length === 0 || coping()}
              class="py-1.5 px-3 font-semibold text-white border border-blue-400 bg-[#00a8ff] text-sm rounded hover:bg-blue-400 transition-colors disabled:bg-blue-400"
            >
              Copy {shiftIds().length} Shifts
            </button>
          </div>
        </SidePopupModal.Footer>
      </ErrorBoundary>
    </Suspense>
  );
};
export default Copy;
