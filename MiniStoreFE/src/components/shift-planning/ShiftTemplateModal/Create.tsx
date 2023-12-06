import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import { Component, createSignal } from "solid-js";
import PopupModal from "~/components/PopupModal";
import { TextInput } from "~/components/form/TextInput";
import { readableToTimeStr } from "../utils/shiftTimes";
import { timeOptions, transformTimeString } from "../utils/timeOptions";
import { ShiftTemplateProps } from "./types";
import { Select } from "~/components/form/Select";
import { roles2 } from "~/utils/roles";
import { schema } from "./formSchema";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { DataResponse, ShiftTemplate } from "~/types";
import { toastSuccess } from "~/utils/toast";
import axios from "axios";

const Create: Component<ShiftTemplateProps> = ({
                                                 setState,
                                                 refreshShiftTemplates,
                                               }) => {
  const [ creating, setCreating ] = createSignal(false);
  const formHandler = useFormHandler(yupSchema(schema));
  const { formData, setFieldValue } = formHandler;

  const submit = async (event: Event) => {
    event.preventDefault();
    if (creating()) return;

    try {
      const f = await formHandler.validateForm({ throwException: false });
      if (f.isFormInvalid) return;

      setCreating(true);

      const { data } = await axios.post<DataResponse<ShiftTemplate>>(
        `${getEndPoint()}/shift-templates/add`,
        {
          ...formData(),
          startTime: readableToTimeStr(formData().startTime),
          endTime: readableToTimeStr(formData().endTime),
        }
      );
      console.log(data);

      if (!data) throw new Error("Invalid response from server");

      refreshShiftTemplates();
      setState("list");
      toastSuccess("Shift template created successfully");
    } catch (error: any) {
      handleFetchError(error);
    } finally {
      setCreating(false);
    }
  };

  const reset = async () => {
    await formHandler.resetForm();
  };

  return (
    <div
      classList={{
        "cursor-progress": creating(),
      }}
    >
      <PopupModal.Body>
        <form onSubmit={submit} class="text-sm max-w-[560px] mx-auto">
          <div class="flex">
            <div class="flex-1 py-2.5 flex flex-col gap-1">
              <label for="name" class="text-gray-700 font-semibold">
                Shift Name
              </label>
              <TextInput
                id="name"
                name="name"
                placeholder="e.g. Morning Shift"
                formHandler={formHandler}
              />
            </div>
          </div>
          <div class="flex gap-2">
            <div class="flex-1 py-2.5 flex flex-col gap-1">
              <label for="shift" class="text-gray-700 font-semibold">
                Start Time
              </label>
              <Select
                id="startTime"
                name="startTime"
                value={0}
                onChange={() =>
                  setFieldValue("endTime", 0, { validate: false })
                }
                placeholder="Select Start Time"
                options={timeOptions()}
                formHandler={formHandler}
              />
            </div>
            <div class="flex-1 py-2.5 flex flex-col gap-1">
              <label for="shift" class="text-gray-700 font-semibold">
                End Time
              </label>
              <Select
                id="endTime"
                name="endTime"
                value={0}
                placeholder="Select End Time"
                options={timeOptions(transformTimeString(formData().startTime))}
                formHandler={formHandler}
                disabled={formData().startTime == "0"}
              />
            </div>
          </div>
          <div class="flex gap-2">
            <div class="flex-1 py-2.5 flex flex-col gap-1">
              <label for="staff" class="text-gray-700 font-semibold">
                Required Role
              </label>
              <Select
                id="role"
                name="role"
                value={roles2[0].value}
                options={roles2}
                formHandler={formHandler}
              />
            </div>
            <div class="flex-1 py-2.5 max-w-[140px] flex flex-col gap-1">
              <label
                for="salaryCoefficient"
                class="text-gray-700 font-semibold"
              >
                Salary Coefficient
              </label>
              <TextInput
                id="salaryCoefficient"
                name="salaryCoefficient"
                type="number"
                step={0.1}
                value={1}
                formHandler={formHandler}
              />
            </div>
          </div>
        </form>
      </PopupModal.Body>
      <PopupModal.Footer>
        <div class="w-full flex justify-between items-center gap-2">
          <button
            type="button"
            onClick={() => {
              reset();
              setState("list");
            }}
            class="flex gap-2 justify-center items-center px-3 text-gray-500 text-sm hover:text-gray-700"
          >
            Back to list
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={creating()}
            class="flex gap-2 justify-center items-center py-1.5 px-3 font-semibold text-white border border-sky-500 bg-sky-500 text-sm rounded hover:bg-sky-600"
          >
            Create
          </button>
        </div>
      </PopupModal.Footer>
    </div>
  );
};

export default Create;
