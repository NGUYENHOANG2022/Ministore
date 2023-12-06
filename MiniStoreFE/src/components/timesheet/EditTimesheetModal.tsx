import * as yup from "yup";
import { useTSContext } from "~/context/Timesheet";
import { yupSchema } from "solid-form-handler/yup";
import { useFormHandler } from "solid-form-handler";
import { Component, createMemo, onCleanup, Show } from "solid-js";
import { createRouteAction } from "solid-start";
import { useRouteData } from "@solidjs/router";
import { routeData } from "~/routes/timesheets";
import { DataResponse, Holiday, Shift, Timesheet, TimesheetStatus, } from "~/types";
import getEndPoint from "~/utils/getEndPoint";
import { readableToTimeStr } from "~/components/shift-planning/utils/shiftTimes";
import handleFetchError from "~/utils/handleFetchError";
import PopupModal from "~/components/PopupModal";
import { TextInput } from "~/components/form/TextInput";
import { capitalize } from "~/utils/capitalize";
import { FaSolidTrash } from "solid-icons/fa";
import { toastError, toastSuccess } from "~/utils/toast";
import { TextArea } from "~/components/form/TextArea";
import moment from "moment";
import axios from "axios";

type EditTimesheetForm = {
  checkInTime: string;
  checkOutTime: string;
  noteTitle?: string;
  noteContent?: string;
};

const schema: yup.Schema<EditTimesheetForm> = yup.object({
  checkInTime: yup.string().required("Invalid check in time"),
  checkOutTime: yup.string().required("Invalid check out time"),
  noteTitle: yup.string(),
  noteContent: yup.string(),
});

const updateTimesheet = async (formData: Omit<Timesheet, "salaryId">) => {
  try {
    const { data } = await axios.put<DataResponse<Timesheet>>(
      `${getEndPoint()}/timesheets/update/${formData.timesheetId}`,
      { ...formData }
    );
    console.log(data);
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

const EditTimesheetModal: Component = () => {
  const { data, holidays } = useRouteData<typeof routeData>();
  const { chosenId, setShowEditModal, showEditModal, onDelete } =
    useTSContext();
  const formHandler = useFormHandler(yupSchema(schema));
  const { formData } = formHandler;
  const [ updating, updateAction ] = createRouteAction(updateTimesheet);
  const timesheet = createMemo(() =>
    !data.error && data() !== undefined
      ? data()?.content.find((t) => t.timesheetId === chosenId())
      : undefined
  );

  // Reset the form data to the default values
  onCleanup(() => {
    formHandler.resetForm();
  });

  const submit = async (status: TimesheetStatus, event: Event) => {
    event.preventDefault();
    if (updating.pending || !timesheet()) return;

    const f = await formHandler.validateForm({ throwException: false });
    if (f.isFormInvalid) return;

    // Check if the check in time is before the check out time
    if (
      moment(formData().checkInTime, "HH:mm").isAfter(
        moment(formData().checkOutTime, "HH:mm")
      )
    ) {
      toastError("Check in time must be before check out time");
      return;
    }

    const success = await updateAction({
      staffId: timesheet()!.staffId,
      shiftId: timesheet()!.shiftId,
      timesheetId: timesheet()!.timesheetId,
      noteTitle: formData().noteTitle,
      noteContent: formData().noteContent,
      status: status,
      checkInTime: readableToTimeStr(formData().checkInTime),
      checkOutTime: readableToTimeStr(formData().checkOutTime),
    });

    if (success) {
      toastSuccess("Shift cover request updated successfully");
      await onCloseModal();
    }
  };

  const onCloseModal = async () => {
    await formHandler.resetForm();
    setShowEditModal(false);
  };

  const isHoliday = (shift: Shift | undefined): Holiday | undefined => {
    if (!shift) return undefined;

    return holidays()?.find((holiday) =>
      moment(shift.date, "YYYY-MM-DD").isBetween(
        holiday.startDate,
        holiday.endDate,
        undefined,
        "[]"
      )
    );
  };

  const holiday = createMemo(() => isHoliday(timesheet()?.shift));

  const coefficient = createMemo(() => {
    return holiday()
      ? holiday()!.coefficient
      : timesheet()?.shift?.salaryCoefficient || 0;
  });

  return (
    <PopupModal.Wrapper
      title="Edit Timesheet"
      close={onCloseModal}
      open={showEditModal}
    >
      <div classList={{ "cursor-progress": updating.pending }}>
        <PopupModal.Body>
          <Show when={holiday()}>
            <label class="mb-1.5 font-semibold text-gray-600 inline-block">
              Note
            </label>
            <p class="text-sm text-green-400 tracking-wide">
              This shift is on a holiday ({holiday()!.name}). The salary
              coefficient is readjusted to {coefficient()}
            </p>
          </Show>
          <form class="text-sm" onSubmit={[ submit, false ]}>
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="staffName"
                  name="staffName"
                  label="Staff Name"
                  disabled={true}
                  value={timesheet()?.staff?.staffName || ""}
                />
              </div>
              <div class="flex-1 py-2.5 max-w-[140px] flex flex-col gap-1">
                <TextInput
                  id="salaryCoefficient"
                  name="salaryCoefficient"
                  label="Salary Coefficient"
                  type="number"
                  disabled={true}
                  value={coefficient()}
                  step={0.1}
                />
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1 overflow-hidden">
                <TextInput
                  id="name"
                  name="name"
                  label="Shift Name"
                  value={timesheet()?.shift?.name || ""}
                  disabled={true}
                />
              </div>
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="role"
                  name="role"
                  label="Required Role"
                  value={capitalize(timesheet()?.shift?.role || "")}
                  disabled={true}
                />
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="date"
                  name="date"
                  type="date"
                  label="Date"
                  value={timesheet()?.shift?.date || ""}
                  disabled
                />
              </div>
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="checkInTime"
                  name="checkInTime"
                  type="time"
                  label="Check In Time"
                  value={timesheet()?.checkInTime || 0}
                  placeholder="Select Check In Time"
                  formHandler={formHandler}
                />
              </div>
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="checkOutTime"
                  name="checkOutTime"
                  type="time"
                  label="Check Out Time"
                  value={timesheet()?.checkOutTime || 0}
                  placeholder="Select Check Out Time"
                  formHandler={formHandler}
                />
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="noteTitle"
                  name="noteTitle"
                  label="Note Title"
                  placeholder="Give your note a title..."
                  value={timesheet()?.noteTitle || ""}
                  formHandler={formHandler}
                />
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextArea
                  id="noteContent"
                  name="noteContent"
                  label="Note Content"
                  value={timesheet()?.noteContent || ""}
                  placeholder="e.g. Any other information you want to include..."
                  formHandler={formHandler}
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
                disabled={updating.pending}
                onClick={[ onDelete, timesheet()?.timesheetId ]}
                class="flex gap-2 justify-center items-center text-gray-500 text-sm hover:text-gray-700"
              >
                <span>
                  <FaSolidTrash/>
                </span>
                <span>Delete</span>
              </button>
            </div>
            <div class="flex gap-2 justify-center items-center">
              <button
                type="button"
                disabled={updating.pending}
                onClick={[
                  submit,
                  timesheet()?.status === TimesheetStatus.REJECTED
                    ? TimesheetStatus.PENDING
                    : TimesheetStatus.REJECTED,
                ]}
                class="py-1.5 px-3 font-semibold border text-sm rounded"
                classList={{
                  "text-white border-red-600 bg-red-500 hover:bg-red-600":
                    timesheet()?.status !== TimesheetStatus.REJECTED,
                  "text-gray-600 border-gray-300 bg-white hover:text-black":
                    timesheet()?.status === TimesheetStatus.REJECTED,
                }}
              >
                {timesheet()?.status === TimesheetStatus.REJECTED
                  ? "Save & Reset"
                  : "Save & Deny"}
              </button>
              <button
                type="button"
                disabled={updating.pending}
                onClick={[
                  submit,
                  timesheet()?.status === TimesheetStatus.APPROVED
                    ? TimesheetStatus.PENDING
                    : TimesheetStatus.APPROVED,
                ]}
                class="py-1.5 px-3 font-semibold border text-sm rounded"
                classList={{
                  "text-white border-green-600 bg-green-500 hover:bg-green-600":
                    timesheet()?.status !== TimesheetStatus.APPROVED,
                  "text-gray-600 border-gray-300 bg-white hover:text-black":
                    timesheet()?.status === TimesheetStatus.APPROVED,
                }}
              >
                {timesheet()?.status === TimesheetStatus.APPROVED
                  ? "Save & Reset"
                  : "Save & Approve"}
              </button>
              <button
                type="button"
                disabled={updating.pending}
                onClick={[
                  submit,
                  timesheet()?.status || TimesheetStatus.PENDING,
                ]}
                class="py-1.5 px-3 font-semibold text-white border border-blue-600 bg-blue-500 text-sm rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </PopupModal.Footer>
      </div>
    </PopupModal.Wrapper>
  );
};

export default EditTimesheetModal;
