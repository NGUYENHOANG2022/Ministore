import PopupModal from "~/components/PopupModal";
import { Accessor, Component, createMemo, Setter, Show } from "solid-js";
import { TextInput } from "~/components/form/TextInput";
import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import * as yup from "yup";
import { DataResponse, LeaveRequest, LeaveRequestStatus, LeaveType, Role, } from "~/types";
import { TextArea } from "~/components/form/TextArea";
import { createRouteAction } from "solid-start";
import getEndPoint from "~/utils/getEndPoint";
import { Select } from "~/components/form/Select";
import { capitalize } from "~/utils/capitalize";
import handleFetchError from "~/utils/handleFetchError";
import { toastError, toastSuccess } from "~/utils/toast";
import moment from "moment";
import { useRouteData } from "@solidjs/router";
import { routeData } from "~/routes/leave-requests";
import { useLRContext } from "~/context/LeaveRequest";
import { useAuth } from "~/context/Auth";
import { FaSolidTrash } from "solid-icons/fa";
import axios from "axios";

type EditLeaveRequest = Omit<LeaveRequest, "status" | "staff">;

const schema: yup.Schema<EditLeaveRequest> = yup.object({
  leaveRequestId: yup.number().required("Leave request ID is required"),
  staffId: yup.number().required("Staff ID is required"),
  leaveType: yup
    .string()
    .oneOf([ LeaveType.VACATION, LeaveType.SICK, LeaveType.OTHER ])
    .required("Leave type is required"),
  startDate: yup.string().required("Start date is required"),
  endDate: yup.string().required("End date is required"),
  reason: yup.string().default(""),
  adminReply: yup.string().default(""),
});

const updateLeaveRequest = async (formData: LeaveRequest) => {
  try {
    const { data } = await axios.put<DataResponse<LeaveRequest>>(
      `${getEndPoint()}/leave-requests/update/${formData.leaveRequestId}`,
      { ...formData }
    );
    console.log(data);
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

const EditLeaveRequestModal: Component<{
  showModal: Accessor<boolean>;
  setShowModal: Setter<boolean>;
}> = ({ setShowModal, showModal }) => {
  const [ updating, updateAction ] = createRouteAction(updateLeaveRequest);
  const { data } = useRouteData<typeof routeData>();
  const { user } = useAuth();
  const { chosenLeaveRequestId, onDelete } = useLRContext();

  const formHandler = useFormHandler(yupSchema(schema), { validateOn: [] });
  const { formData } = formHandler;

  const curLeaveRequest = createMemo(() =>
    !data.error && data.state === "ready"
      ? data()?.content.find((lr) => lr.leaveRequestId === chosenLeaveRequestId())
      : undefined
  );

  const submit = async (status: LeaveRequestStatus, e: Event) => {
    e.preventDefault();
    if (updating.pending) return;

    const f = await formHandler.validateForm({ throwException: false });

    console.log(f.isFormInvalid);
    if (f.isFormInvalid) return;

    if (moment(formData().startDate, "YYYY-MM-DD").isAfter(formData().endDate))
      return toastError("Start date cannot be greater than end date");

    const adminReply = user()?.role === Role.ADMIN ? formData().adminReply : "";

    const success = await updateAction({ ...formData(), status, adminReply });

    if (success) {
      toastSuccess("Leave request updated successfully");
      setShowModal(false);
    }
  };

  const onCloseModal = async () => {
    await formHandler.resetForm();
    setShowModal(false);
  };

  return (
    <PopupModal.Wrapper
      title="Edit Leave Request"
      close={onCloseModal}
      open={showModal}
    >
      <div
        classList={{
          "cursor-progress": updating.pending,
        }}
      >
        <PopupModal.Body>
          <form class="text-sm" onSubmit={[ submit, LeaveRequestStatus.PENDING ]}>
            <div class="flex">
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="staffName"
                  name="staffName"
                  label="Staff Member"
                  value={curLeaveRequest()?.staff?.staffName || ""}
                  placeholder="Your name"
                  disabled={true}
                />
              </div>
              <TextInput
                id="staffId"
                name="staffId"
                value={curLeaveRequest()?.staffId || 0}
                disabled={true}
                hidden={true}
                formHandler={formHandler}
              />
              <TextInput
                id="leaveRequestId"
                name="leaveRequestId"
                value={curLeaveRequest()?.leaveRequestId || 0}
                disabled={true}
                hidden={true}
                formHandler={formHandler}
              />
            </div>
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="startDate"
                  name="startDate"
                  label="Start Date"
                  value={curLeaveRequest()?.startDate || ""}
                  type="date"
                  placeholder="Select a date"
                  formHandler={formHandler}
                  disabled={
                    curLeaveRequest()?.status !== LeaveRequestStatus.PENDING ||
                    curLeaveRequest()?.staffId !== user()?.staffId
                  }
                />
              </div>
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="endDate"
                  name="endDate"
                  label="End Date"
                  type="date"
                  value={curLeaveRequest()?.endDate || ""}
                  placeholder="Select a date"
                  formHandler={formHandler}
                  disabled={
                    curLeaveRequest()?.status !== LeaveRequestStatus.PENDING ||
                    curLeaveRequest()?.staffId !== user()?.staffId
                  }
                />
              </div>
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <Select
                  id="leaveType"
                  name="leaveType"
                  label="Leave Type"
                  value={curLeaveRequest()?.leaveType || LeaveType.VACATION}
                  options={[
                    {
                      label: capitalize(LeaveType.VACATION),
                      value: LeaveType.VACATION,
                    },
                    {
                      label: capitalize(LeaveType.SICK),
                      value: LeaveType.SICK,
                    },
                    {
                      label: capitalize(LeaveType.OTHER),
                      value: LeaveType.OTHER,
                    },
                  ]}
                  formHandler={formHandler}
                  disabled={
                    curLeaveRequest()?.status !== LeaveRequestStatus.PENDING ||
                    curLeaveRequest()?.staffId !== user()?.staffId
                  }
                />
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1 overflow-hidden">
                <TextArea
                  id="reason"
                  name="reason"
                  label="Note"
                  value={curLeaveRequest()?.reason || ""}
                  placeholder="e.g. Any other information you want to include..."
                  formHandler={formHandler}
                  disabled={
                    curLeaveRequest()?.status !== LeaveRequestStatus.PENDING ||
                    curLeaveRequest()?.staffId !== user()?.staffId
                  }
                />
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1 overflow-hidden">
                <TextArea
                  id="adminReply"
                  name="adminReply"
                  label="Admin Reply"
                  value={curLeaveRequest()?.adminReply || ""}
                  placeholder="Admin message to staff member..."
                  formHandler={formHandler}
                  disabled={user()?.role !== Role.ADMIN}
                />
              </div>
            </div>
          </form>
        </PopupModal.Body>
        <PopupModal.Footer>
          <div class="w-full flex justify-between items-center gap-2">
            <Show when={curLeaveRequest()?.status === LeaveRequestStatus.PENDING || user()?.role === Role.ADMIN}>
              <div class="flex gap-2 justify-center items-center">
                <button
                  type="button"
                  disabled={updating.pending}
                  onClick={[ onDelete, curLeaveRequest()?.leaveRequestId || 0 ]}
                  class="flex gap-2 justify-center items-center px-3 text-gray-500 text-sm hover:text-gray-700"
                >
                <span>
                  <FaSolidTrash/>
                </span>
                  <span>Delete</span>
                </button>
              </div>
            </Show>
            <div class="flex gap-2 justify-center items-center">
              <Show when={user()?.role === Role.ADMIN}>
                <button
                  type="button"
                  disabled={updating.pending}
                  onClick={[
                    submit,
                    curLeaveRequest()?.status === LeaveRequestStatus.REJECTED
                      ? LeaveRequestStatus.PENDING
                      : LeaveRequestStatus.REJECTED,
                  ]}
                  class="py-1.5 px-3 font-semibold border text-sm rounded"
                  classList={{
                    "text-white border-red-600 bg-red-500 hover:bg-red-600":
                      curLeaveRequest()?.status !== LeaveRequestStatus.REJECTED,
                    "text-gray-600 border-gray-300 bg-white hover:text-black":
                      curLeaveRequest()?.status === LeaveRequestStatus.REJECTED,
                  }}
                >
                  {curLeaveRequest()?.status === LeaveRequestStatus.REJECTED
                    ? "Save & Reset"
                    : "Save & Deny"}
                </button>
                <button
                  type="button"
                  disabled={updating.pending}
                  onClick={[
                    submit,
                    curLeaveRequest()?.status === LeaveRequestStatus.APPROVED
                      ? LeaveRequestStatus.PENDING
                      : LeaveRequestStatus.APPROVED,
                  ]}
                  class="py-1.5 px-3 font-semibold border text-sm rounded"
                  classList={{
                    "text-white border-green-600 bg-green-500 hover:bg-green-600":
                      curLeaveRequest()?.status !== LeaveRequestStatus.APPROVED,
                    "text-gray-600 border-gray-300 bg-white hover:text-black":
                      curLeaveRequest()?.status === LeaveRequestStatus.APPROVED,
                  }}
                >
                  {curLeaveRequest()?.status === LeaveRequestStatus.APPROVED
                    ? "Save & Reset"
                    : "Save & Approve"}
                </button>
              </Show>
              <Show when={curLeaveRequest()?.status === LeaveRequestStatus.PENDING || user()?.role === Role.ADMIN}>
                <button
                  type="button"
                  disabled={updating.pending}
                  onClick={[
                    submit,
                    curLeaveRequest()?.status || LeaveRequestStatus.PENDING,
                  ]}
                  class="py-1.5 px-3 font-semibold text-white border border-blue-600 bg-blue-500 text-sm rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </Show>
            </div>
          </div>
        </PopupModal.Footer>
      </div>
    </PopupModal.Wrapper>
  );
};

export default EditLeaveRequestModal;
