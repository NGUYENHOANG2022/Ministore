import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import { FaSolidTrash } from "solid-icons/fa";
import { Accessor, batch, Component, createSignal, onCleanup, Setter, Show, } from "solid-js";
import PopupModal from "~/components/PopupModal";
import { TextInput } from "~/components/form/TextInput";
import { ShiftCard, useSPData } from "~/context/ShiftPlanning";
import { DataResponse, Role, Shift } from "~/types";
import { Tabs } from ".";
import { readableToTimeStr } from "../utils/shiftTimes";
import { timeOptions, transformTimeString } from "../utils/timeOptions";
import * as yup from "yup";
import { Select } from "~/components/form/Select";
import { roles } from "~/utils/roles";
import isDayInThePast from "../../../utils/isDayInThePast";
import moment from "moment";
import { getShiftRules } from "~/components/shift-planning/utils/shiftRules";
import handleFetchError from "~/utils/handleFetchError";
import getEndPoint from "~/utils/getEndPoint";
import { cellIdGenerator } from "~/components/shift-planning/utils/cellIdGenerator";
import { sortBy } from "lodash";
import { toastSuccess } from "~/utils/toast";
import { TbSpeakerphone } from "solid-icons/tb";
import axios from "axios";

type EditScheduleForm = {
  shiftId: number;
  staffId: number;
  startTime: string;
  endTime: string;
  salaryCoefficient: number;
  name: string;
  role: Role;
  date: Date;
};

const validTimeOptions = timeOptions().map((item) => item.value);
const schema: yup.Schema<EditScheduleForm> = yup.object({
  shiftId: yup.number().required("Invalid shift id"),
  name: yup.string().required("Please give this shift a name"),
  staffId: yup
    .number()
    .min(1, "Please select a staff")
    .required("Please select a staff"),
  startTime: yup
    .string()
    .oneOf(validTimeOptions, "Invalid time options")
    .required("Please select a start time"),
  endTime: yup
    .string()
    .oneOf(validTimeOptions, "Invalid time options")
    .required("Please select a end time"),
  role: yup
    .string()
    .oneOf(
      [ Role.MANAGER, Role.CASHIER, Role.GUARD, Role.ADMIN, Role.ALL_ROLES ],
      "Invalid role"
    )
    .required("Please select a role"),
  salaryCoefficient: yup
    .number()
    .min(1, "Coefficient can not below 1")
    .required("Please select a coefficient"),
  date: yup.date().required("Please select a date"),
});

interface EditProps {
  setModalState: Setter<Tabs>;
  setShiftModalData: Setter<ShiftCard>;
  setShowModal: Setter<boolean>;
  modalState: Accessor<Tabs>;
  modalData: Accessor<ShiftCard | undefined>;
  onDelete: () => void;
  openCreateCoverModal: () => void;
}

const Edit: Component<EditProps> = ({
                                      setModalState,
                                      modalData,
                                      onDelete,
                                      openCreateCoverModal,
                                      setShowModal,
                                    }) => {
  const { tableData, setTableData } = useSPData();
  const formHandler = useFormHandler(yupSchema(schema));
  const { formData, setFieldValue } = formHandler;
  const [ updating, setUpdating ] = createSignal(false);
  const isOldShift = isDayInThePast(modalData()?.date || "");

  // Reset the form data to the default values
  onCleanup(() => {
    formHandler.resetForm();
  });

  const submit = async (publish: boolean, event: Event) => {
    event.preventDefault();
    if (isOldShift || updating()) return;

    try {
      const f = await formHandler.validateForm({ throwException: false });
      console.log("submit", formData());
      if (f.isFormInvalid) return;

      setUpdating(true);
      const dateStr = moment(formData().date).format("YYYY-MM-DD");
      const staff = tableData.staffs.find(
        (staff) => staff.staffId === formData().staffId
      );

      // If the date is in the past, throw an error
      if (isDayInThePast(dateStr))
        throw new Error("Can not edit shift in the past");

      // If the staff is not found, throw an error
      if (!staff) throw new Error("Invalid staff");

      // Check if the shift is valid
      const notPassedRules = getShiftRules(
        { ...formData(), published: publish, date: dateStr },
        { staff, date: dateStr },
        tableData
      ).filter((rule) => !rule.passed);
      if (notPassedRules.length > 0)
        throw new Error(notPassedRules[0].errorName);

      // Update the shift
      const { data } = await axios.put<DataResponse<Shift>>(
        `${getEndPoint()}/shifts/update/${modalData()?.shiftId}`,
        {
          ...formData(),
          startTime: readableToTimeStr(formData().startTime),
          endTime: readableToTimeStr(formData().endTime),
          published: publish,
        }
      );
      console.log(data);
      if (!data) throw new Error("Invalid response from server");

      // Update the table data. Update the shifts and cells
      // NOTE: Cells must be updated at last, because we need to set the new shift data first
      batch(() => {
        setTableData("shifts", data.content.shiftId, data.content);
        setTableData("cells", cellIdGenerator(staff, dateStr), (shiftIds) => {
          const sortedShifts = sortBy(shiftIds, [
            (shiftId) => tableData.shifts[shiftId].startTime,
          ]);
          return [ ...sortedShifts ];
        });
        setModalState("details");
        setShowModal(false);
      });

      toastSuccess("Shift updated successfully");
    } catch (error: any) {
      handleFetchError(error);
    } finally {
      setUpdating(false);
    }
  };

  const onCancel = () => {
    setModalState("details");
  };

  return (
    <div
      classList={{
        "cursor-progress": updating(),
      }}
    >
      <PopupModal.Body>
        <form class="text-sm" onSubmit={[ submit, false ]}>
          <Show when={isOldShift}>
            <div class="mb-2 w-[560px]">
              <label class="mb-1.5 font-semibold text-gray-600 inline-block">
                Note
              </label>
              <p class="text-gray-400 text-sm tracking-wide">
                Since this shift has passed, you can not change the information
                of this shift.
              </p>
            </div>
          </Show>
          <TextInput
            id="shiftId"
            name="shiftId"
            disabled={isOldShift}
            hidden={true}
            value={modalData()?.shiftId || 0}
            formHandler={formHandler}
          />
          <div class="flex gap-2">
            <div class="flex-1 py-2.5 flex flex-col gap-1">
              <label for="staffId" class="text-gray-700 font-semibold">
                Staff Members
              </label>
              <Select
                id="staffId"
                name="staffId"
                value={modalData()?.staffId || 0}
                placeholder="Select a staff member"
                options={tableData.staffs.map((staff) => ({
                  value: staff.staffId,
                  label: staff.staffName,
                }))}
                formHandler={formHandler}
                disabled
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
                disabled={isOldShift}
                value={modalData()?.salaryCoefficient || 0}
                step={0.1}
                formHandler={formHandler}
              />
            </div>
          </div>
          <div class="flex gap-2">
            <div class="flex-1 py-2.5 flex flex-col gap-1 overflow-hidden">
              <label for="name" class="text-gray-700 font-semibold">
                Shift Name
              </label>
              <TextInput
                id="name"
                name="name"
                value={modalData()?.name || ""}
                formHandler={formHandler}
                disabled={isOldShift}
              />
            </div>
            <div class="flex-1 py-2.5 flex flex-col gap-1">
              <label for="role" class="text-gray-700 font-semibold">
                Required Role
              </label>
              <Select
                id="role"
                name="role"
                value={modalData()?.role}
                options={roles}
                formHandler={formHandler}
                disabled={isOldShift}
              />
            </div>
          </div>
          <div class="flex gap-2">
            <div class="flex-1 py-2.5 flex flex-col gap-1">
              <label for="date" class="text-gray-700 font-semibold">
                Date
              </label>
              <TextInput
                id="date"
                name="date"
                type="date"
                value={modalData()?.date || ""}
                formHandler={formHandler}
                disabled
              />
            </div>
            <div class="flex-1 py-2.5 flex flex-col gap-1">
              <label for="startTime" class="text-gray-700 font-semibold">
                Start Time
              </label>
              <Select
                id="startTime"
                name="startTime"
                value={modalData()?.startTime! || 0}
                onChange={() =>
                  setFieldValue("endTime", 0, { validate: false })
                }
                placeholder="Select Start Time"
                options={timeOptions()}
                formHandler={formHandler}
                disabled={isOldShift}
              />
            </div>
            <div class="flex-1 py-2.5 flex flex-col gap-1">
              <label for="endTime" class="text-gray-700 font-semibold">
                End Time
              </label>
              <Select
                id="endTime"
                name="endTime"
                value={modalData()?.endTime! || 0}
                placeholder="Select End Time"
                options={timeOptions(transformTimeString(formData().startTime))}
                formHandler={formHandler}
                disabled={formData().startTime == "0" || isOldShift}
              />
            </div>
          </div>
        </form>
      </PopupModal.Body>
      <PopupModal.Footer>
        <div class="w-full flex justify-between items-center gap-2">
          <div class="flex gap-2 justify-center items-center">
            <button
              type="button"
              disabled={updating()}
              onClick={onDelete}
              class="flex gap-2 justify-center items-center text-gray-500 text-sm hover:text-gray-700"
            >
              <span>
                <FaSolidTrash/>
              </span>
              <span>Delete</span>
            </button>
            {/*<Show when={!modalData()?.shiftCoverRequest}>*/}
              <button
                type="button"
                onClick={openCreateCoverModal}
                class="flex gap-2 justify-center items-center text-gray-500 text-sm hover:text-gray-700 tracking-wide"
              >
                <span class="text-base font-bold">
                  <TbSpeakerphone/>
                </span>
                <span>New Shift Cover</span>
              </button>
            {/*</Show>*/}
          </div>
          <Show when={!isOldShift}>
            <div class="flex gap-2 justify-center items-center">
              <button
                type="button"
                disabled={updating()}
                onClick={onCancel}
                class="flex gap-2 justify-center items-center px-3 text-gray-500 text-sm hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updating()}
                onClick={[ submit, !modalData()?.published ]}
                class="py-1.5 px-3 font-semibold text-gray-600 border border-gray-300 text-sm rounded hover:text-black"
              >
                Save & {modalData()?.published ? "Unpublish" : "Publish"}
              </button>
              <button
                type="button"
                onClick={[ submit, modalData()?.published ]}
                disabled={updating()}
                class="py-1.5 px-3 font-semibold text-white border border-blue-600 bg-blue-500 text-sm rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </Show>
        </div>
      </PopupModal.Footer>
    </div>
  );
};

export default Edit;
