import PopupModal from "~/components/PopupModal";
import { Accessor, Component, Setter, Show } from "solid-js";
import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import * as yup from "yup";
import { DataResponse, LeaveRequest, Role, ShiftCoverRequest, ShiftCoverRequestStatus, } from "~/types";
import { TextArea } from "~/components/form/TextArea";
import { createRouteAction } from "solid-start";
import getEndPoint from "~/utils/getEndPoint";
import { Select } from "~/components/form/Select";
import { capitalize } from "~/utils/capitalize";
import handleFetchError from "~/utils/handleFetchError";
import { toastError, toastSuccess } from "~/utils/toast";
import { shiftDetailsTime } from "~/components/shift-planning/utils/shiftTimes";
import { useSPData, useSPModals } from "~/context/ShiftPlanning";
import { useAuth } from "~/context/Auth";
import axios from "axios";

type CreateCoverRequest = {
  staffId: number;
  shiftId: number;
  note: string;
};

const schema: yup.Schema<CreateCoverRequest> = yup.object({
  staffId: yup
    .number()
    .min(1, "Staff is required")
    .required("Staff is required"),
  shiftId: yup
    .number()
    .min(1, "Shift not found")
    .required("Shift ID is required"),
  note: yup.string().default(""),
});

const createCoverRequest = async (
  formData: Omit<ShiftCoverRequest, "shiftCoverRequestId">
) => {
  try {
    const { data } = await axios.post<DataResponse<LeaveRequest>>(
      `${getEndPoint()}/shift-cover-requests/add`,
      { ...formData }
    );
    console.log(data);
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

const CreateCoverRequestModal: Component<{
  showModal: Accessor<boolean>;
  setShowModal: Setter<boolean>;
}> = ({ setShowModal, showModal }) => {
  const [ echoing, echo ] = createRouteAction(createCoverRequest);
  const { tableData, saveChanges } = useSPData();
  const { shiftModalData } = useSPModals();
  const { user } = useAuth();
  const formHandler = useFormHandler(yupSchema(schema), { validateOn: [] });
  const { formData } = formHandler;
  const onCloseModal = async () => {
    await formHandler.resetForm();
    setShowModal(false);
  };

  const submit = async (status: ShiftCoverRequestStatus, e: Event) => {
    e.preventDefault();
    if (echoing.pending) return;

    const f = await formHandler.validateForm({ throwException: false });

    if (f.isFormInvalid) return;

    // Check if the shift is already covered
    if (shiftModalData()?.shiftCoverRequest) {
      toastError("This shift is already covered");
      return;
    }

    // Check if the shift is already taken attendance
    if (shiftModalData()?.timesheet) {
      toastError(
        "You can't assign this shift because it is already recorded in timesheet"
      );
      return;
    }

    if (shiftModalData()?.staffId === formData().staffId) {
      toastError("You can't assign this shift to yourself");
      return;
    }

    const success = await echo({ ...formData(), status });

    if (success) {
      toastSuccess("Shift cover request created successfully");
      await formHandler.resetForm();
      setShowModal(false);
      saveChanges();
    }
  };

  return (
    <PopupModal.Wrapper
      title="New Shift Cover Request"
      close={onCloseModal}
      open={showModal}
    >
      <div
        classList={{
          "cursor-progress": echoing.pending,
        }}
      >
        <PopupModal.Body>
          <div class="p-5 mb-5 -mx-5 -mt-5 border-b border-gray-200">
            <div
              class="rounded mx-0.5 p-2 relative text-left select-none"
              classList={{
                "bg-[#edf2f7] text-black": shiftModalData()?.published,
                "bg-[repeating-linear-gradient(-45deg,white,white_5px,#eaf0f6_5px,#eaf0f6_10px)] border border-gray-200":
                  !shiftModalData()?.published,
              }}
            >
              <i
                class="absolute top-1 left-1.5 bottom-1 w-1.5 rounded"
                classList={{
                  "bg-blue-500": shiftModalData()?.role === Role.CASHIER,
                  "bg-yellow-500": shiftModalData()?.role === Role.GUARD,
                  "bg-red-500": shiftModalData()?.role === Role.MANAGER,
                  "bg-gray-600": shiftModalData()?.role === Role.ADMIN,
                  "bg-gray-400": shiftModalData()?.role === Role.ALL_ROLES,
                }}
              ></i>
              <p class="ml-3.5 font-semibold text-sm tracking-wider">
                {shiftDetailsTime(
                  shiftModalData()?.date || "",
                  shiftModalData()?.startTime || "",
                  shiftModalData()?.endTime || ""
                )}
              </p>
              <p class="ml-3.5 font-normal text-xs tracking-wider">
                {shiftModalData()?.name} -{" "}
                {capitalize(shiftModalData()?.role || "")}
              </p>
            </div>
          </div>
          <form
            class="text-sm"
            onSubmit={[ submit, ShiftCoverRequestStatus.PENDING ]}
          >
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <Select
                  id="staffId"
                  name="staffId"
                  label="Assign to Staff Member"
                  value={0}
                  placeholder={"Select staff member"}
                  options={(user()?.role === Role.ADMIN ? tableData.staffs : tableData.staffsInfo!)
                    .filter((staff) => staff.role !== Role.ADMIN)
                    .map((staff) => ({
                      label: staff.staffName,
                      value: staff.staffId,
                    }))
                    .filter(
                      (staff) => staff.value !== shiftModalData()?.staffId
                    )
                  }
                  formHandler={formHandler}
                />
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1 overflow-hidden">
                <TextArea
                  id="note"
                  name="note"
                  label="Note"
                  placeholder="e.g. Any other information you want to include with this shift cover request..."
                  formHandler={formHandler}
                />
                <TextArea
                  id="shiftId"
                  name="shiftId"
                  value={shiftModalData()?.shiftId || 0}
                  hidden={true}
                  formHandler={formHandler}
                />
              </div>
            </div>
          </form>
        </PopupModal.Body>
        <PopupModal.Footer>
          <div class="w-full flex justify-end items-center gap-2">
            <Show when={user()?.role === Role.ADMIN}>
              <>
                <button
                  type="button"
                  disabled={echoing.pending}
                  onClick={[ submit, ShiftCoverRequestStatus.REJECTED ]}
                  class="py-1.5 px-3 font-semibold text-white border border-red-600 bg-red-500 text-sm rounded hover:bg-red-600"
                >
                  Save & Deny
                </button>
                <button
                  type="button"
                  disabled={echoing.pending}
                  onClick={[ submit, ShiftCoverRequestStatus.APPROVED ]}
                  class="py-1.5 px-3 font-semibold text-white border border-green-600 bg-green-500 text-sm rounded hover:bg-green-600"
                >
                  Save & Approve
                </button>
              </>
            </Show>
            <button
              type="button"
              disabled={echoing.pending}
              onClick={[ submit, ShiftCoverRequestStatus.PENDING ]}
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

export default CreateCoverRequestModal;
