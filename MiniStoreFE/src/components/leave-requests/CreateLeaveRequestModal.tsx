import PopupModal from "~/components/PopupModal";
import { Accessor, Component, Setter, Show } from "solid-js";
import { TextInput } from "~/components/form/TextInput";
import { useAuth } from "~/context/Auth";
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
import axios from "axios";

type CreateLeaveRequest = {
  staffId: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
};

const schema: yup.Schema<CreateLeaveRequest> = yup.object({
  staffId: yup.number().required("Staff ID is required"),
  leaveType: yup
    .string()
    .oneOf([ LeaveType.VACATION, LeaveType.SICK, LeaveType.OTHER ])
    .required("Leave type is required"),
  startDate: yup.string().required("Start date is required"),
  endDate: yup.string().required("End date is required"),
  reason: yup.string().default(""),
});

const createLeaveRequest = async (
  formData: Omit<LeaveRequest, "leaveRequestId">
) => {
  try {
    const { data } = await axios.post<DataResponse<LeaveRequest>>(
      `${getEndPoint()}/leave-requests/add`,
      { ...formData }
    );
    console.log(data);
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

const CreateLeaveRequestModal: Component<{
  showModal: Accessor<boolean>;
  setShowModal: Setter<boolean>;
}> = ({ setShowModal, showModal }) => {
  const [ echoing, echo ] = createRouteAction(createLeaveRequest);
  const { user } = useAuth();
  const formHandler = useFormHandler(yupSchema(schema), { validateOn: [] });
  const { formData } = formHandler;

  const submit = async (status: LeaveRequestStatus, e: Event) => {
    e.preventDefault();
    if (echoing.pending) return;

    const f = await formHandler.validateForm({ throwException: false });

    if (f.isFormInvalid) return;

    if (moment(formData().startDate, "YYYY-MM-DD").isAfter(formData().endDate))
      return toastError("Start date cannot be greater than end date");

    const success = await echo({ ...formData(), status, adminReply: "" });

    if (success) {
      toastSuccess("Leave request created successfully");
      await formHandler.resetForm();
      setShowModal(false);
    }
  };

  const onCloseModal = async () => {
    await formHandler.resetForm();
    setShowModal(false);
  };

  return (
    <PopupModal.Wrapper
      title="New Leave Request"
      close={onCloseModal}
      open={showModal}
    >
      <div
        classList={{
          "cursor-progress": echoing.pending,
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
                  value={user()?.staffName || ""}
                  placeholder="Your name"
                  disabled={true}
                />
              </div>
              <TextInput
                id="staffId"
                name="staffId"
                value={user()?.staffId || 0}
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
                  type="date"
                  placeholder="Select a date"
                  formHandler={formHandler}
                />
              </div>
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="endDate"
                  name="endDate"
                  label="End Date"
                  type="date"
                  placeholder="Select a date"
                  formHandler={formHandler}
                />
              </div>
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <Select
                  id="leaveType"
                  name="leaveType"
                  label="Leave Type"
                  value={LeaveType.VACATION}
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
                />
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1 overflow-hidden">
                <TextArea
                  id="reason"
                  name="reason"
                  label="Note"
                  placeholder="e.g. Any other information you want to include..."
                  formHandler={formHandler}
                />
              </div>
            </div>
          </form>
        </PopupModal.Body>
        <PopupModal.Footer>
          <div class="w-full flex justify-end items-center gap-2">
            <Show when={user()?.role === Role.ADMIN}>
              <button
                type="button"
                disabled={echoing.pending}
                onClick={[ submit, LeaveRequestStatus.REJECTED ]}
                class="py-1.5 px-3 font-semibold text-white border border-red-600 bg-red-500 text-sm rounded hover:bg-red-600"
              >
                Save & Deny
              </button>
              <button
                type="button"
                disabled={echoing.pending}
                onClick={[ submit, LeaveRequestStatus.APPROVED ]}
                class="py-1.5 px-3 font-semibold text-white border border-green-600 bg-green-500 text-sm rounded hover:bg-green-600"
              >
                Save & Approve
              </button>
            </Show>
            <button
              type="button"
              disabled={echoing.pending}
              onClick={[ submit, LeaveRequestStatus.PENDING ]}
              class="py-1.5 px-3 font-semibold text-white border border-blue-600 bg-blue-500 text-sm rounded hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        </PopupModal.Footer>
      </div>
    </PopupModal.Wrapper>
  );
};

export default CreateLeaveRequestModal;
