import { flatten } from "lodash";
import { Accessor, Component, createSignal, For, Setter } from "solid-js";
import SidePopupModal from "~/components/SidePopupModal";
import { TextArea } from "~/components/form/TextArea";
import { TextInput } from "~/components/form/TextInput";
import { ScheduleTemplateModalState, useSPData } from "~/context/ShiftPlanning";
import { DataResponse, Role, Shift } from "~/types";
import { shiftDetailsTime } from "../utils/shiftTimes";
import { roles } from "~/utils/roles";
import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import * as yup from "yup";
import axios from "axios";
import getEndPoint from "~/utils/getEndPoint";
import { toastSuccess } from "~/utils/toast";
import handleFetchError from "~/utils/handleFetchError";

type CreateProps = {
  modalState: Accessor<ScheduleTemplateModalState>;
  setModalState: Setter<ScheduleTemplateModalState>;
};

const schema: yup.Schema<{ name: string; description?: string }> = yup.object({
  name: yup.string().required("Please enter a name"),
  description: yup.string().default(""),
});

const Create: Component<CreateProps> = ({ setModalState }) => {
  const { tableData } = useSPData();
  const formHandler = useFormHandler(yupSchema(schema));
  const { formData } = formHandler;
  const [ creating, setCreating ] = createSignal(false);

  const shiftIds = flatten(Object.values(tableData.cells));

  const submit = async () => {
    if (creating()) return;
    try {
      const f = await formHandler.validateForm({ throwException: false });
      if (f.isFormInvalid) return;

      setCreating(true);
      // Create shifts
      const { data } = await axios.post<DataResponse<Shift[]>>(
        `${getEndPoint()}/schedule-templates/add`,
        {
          name: formData().name,
          description: formData().description,
          scheduleShiftTemplates: shiftIds.map((id) => ({
            date: tableData.shifts[id].date,
            startTime: tableData.shifts[id].startTime,
            endTime: tableData.shifts[id].endTime,
            role: tableData.shifts[id].role,
            name: tableData.shifts[id].name,
            salaryCoefficient: tableData.shifts[id].salaryCoefficient,
            staffId: tableData.shifts[id].staffId,
          }))
        }
      );
      // console.log(data);
      if (!data) throw new Error("Invalid response from server");

      toastSuccess("Week template was created successfully");
      setModalState("list");
    } catch (error: any) {
      handleFetchError(error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <SidePopupModal.Body classList={{ "cursor-progress": creating() }}>
        <div class="text-sm mb-4 text-gray-400 leading-[1.5] tracking-wide">
          Select the template that you would like to use from the list below.
          You will be able to preview the shifts that will be created in the
          next step.
        </div>
        <TextInput
          id="name"
          name="name"
          label="Name"
          placeholder="e.g. Default, Full Staff, etc."
          classList={{ "text-sm mb-4": true }}
          class="shadow-inner"
          formHandler={formHandler}
        />
        <TextArea
          id="description"
          name="description"
          label="Description"
          placeholder="Any information you want to include with this template..."
          classList={{ "text-sm mb-4": true }}
          class="shadow-inner"
          formHandler={formHandler}
        />
        <div
          class="text-[#637286] bg-[#f8fafc] font-semibold py-2.5 px-5 border-y border-[#d5dce6] -mx-5 mt-5 mb-3.5 text-sm">
          Targeted Shifts
        </div>
        <div class="text-sm mb-4 text-gray-400 leading-[1.5] tracking-wide">
          You are targeting{" "}
          <span class="font-bold">{shiftIds.length} Shifts</span> with the
          filters you have set:
        </div>
        <For each={shiftIds}>
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
                  "bg-blue-500":
                    tableData.shifts[shift].role === Role.CASHIER,
                  "bg-yellow-500":
                    tableData.shifts[shift].role === Role.GUARD,
                  "bg-red-500":
                    tableData.shifts[shift].role === Role.MANAGER,
                  "bg-gray-600":
                    tableData.shifts[shift].role === Role.ADMIN,
                  "bg-gray-400":
                    tableData.shifts[shift].role === Role.ALL_ROLES,
                }}
              ></i>
              <p class="ml-3.5 font-semibold text-sm tracking-wider">
                {shiftDetailsTime(
                  tableData.shifts[shift].date || "",
                  tableData.shifts[shift].startTime || "",
                  tableData.shifts[shift].endTime || ""
                )}
              </p>
              <p class="ml-3.5 font-normal text-xs text-[13px] tracking-wider">
                {tableData.shifts[shift].staff?.staffName ||
                  "No staff assigned"}{" "}
                •{" "}
                {
                  roles.find(
                    (r) =>
                      r.value === tableData.shifts[shift].role
                  )?.label
                }
              </p>
            </div>
          )}
        </For>
      </SidePopupModal.Body>
      <SidePopupModal.Footer>
        <div class="w-full flex justify-between items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setModalState("list");
            }}
            class="flex gap-2 justify-center items-center px-3 text-gray-500 text-sm hover:text-gray-700"
          >
            Back to list
          </button>
          <button
            type="button"
            onClick={submit}
            class="py-1.5 px-3 font-semibold text-white border border-blue-400 bg-[#00a8ff] text-sm rounded hover:bg-blue-400 transition-colors"
          >
            Create Template - {shiftIds.length} Shifts
          </button>
        </div>
      </SidePopupModal.Footer>
    </>
  );
};
export default Create;
