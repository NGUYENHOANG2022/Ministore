import PopupModal from "~/components/PopupModal";
import { Accessor, Component, createMemo, Setter, Show } from "solid-js";
import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import * as yup from "yup";
import { DataResponse, Role, ShiftCoverRequest, ShiftCoverRequestStatus, } from "~/types";
import { createRouteAction } from "solid-start";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { toastSuccess } from "~/utils/toast";
import { useRouteData } from "@solidjs/router";
import { routeData } from "~/routes/shift-cover-requests";
import { useAuth } from "~/context/Auth";
import { FaSolidTrash } from "solid-icons/fa";
import { useSCRContext } from "~/context/CoverRequest";
import { capitalize } from "~/utils/capitalize";
import { shiftDetailsTime } from "~/components/shift-planning/utils/shiftTimes";
import { Select } from "~/components/form/Select";
import { TextArea } from "~/components/form/TextArea";
import axios from "axios";

const schema: yup.Schema<
  Omit<ShiftCoverRequest, "staff" | "shift" | "status">
> = yup.object({
  shiftCoverRequestId: yup
    .number()
    .required("Shift cover request ID is required"),
  shiftId: yup.number().required("Shift ID is required"),
  staffId: yup.number().required("Staff ID is required"),
  note: yup.string().default(""),
});

const updateCoverRequest = async (formData: ShiftCoverRequest) => {
  try {
    const { data } = await axios.put<DataResponse<ShiftCoverRequest>>(
      `${getEndPoint()}/shift-cover-requests/update/${
        formData.shiftCoverRequestId
      }`,
      { ...formData }
    );
    console.log(data);
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

const EditCoverRequestModal: Component<{
  showModal: Accessor<boolean>;
  setShowModal: Setter<boolean>;
}> = ({ setShowModal, showModal }) => {
  const [ updating, updateAction ] = createRouteAction(updateCoverRequest);
  const { data, staffInfos } = useRouteData<typeof routeData>();
  const { user } = useAuth();
  const { chosenRequestId, onDelete } = useSCRContext();

  const formHandler = useFormHandler(yupSchema(schema), { validateOn: [] });
  const { formData } = formHandler;

  const curCoverRequest = createMemo(() =>
    !data.error && data() !== undefined
      ? data()?.content.find((sc) => sc.shiftCoverRequestId === chosenRequestId())
      : undefined
  );

  const submit = async (status: ShiftCoverRequestStatus, e: Event) => {
    e.preventDefault();
    if (updating.pending) return;

    const f = await formHandler.validateForm({ throwException: false });

    console.log(f);
    if (f.isFormInvalid) return;

    const success = await updateAction({ ...formData(), status });

    if (success) {
      toastSuccess("Shift cover request updated successfully");
      setShowModal(false);
    }
  };

  const onCloseModal = async () => {
    await formHandler.resetForm();
    setShowModal(false);
  };

  return (
    <PopupModal.Wrapper
      title="Edit Shift Cover Request"
      close={onCloseModal}
      open={showModal}
    >
      <Show when={!staffInfos.error && staffInfos() !== undefined}>
        <div
          classList={{
            "cursor-progress": updating.pending,
          }}
        >
          <PopupModal.Body>
            <div class="p-5 mb-5 -mx-5 -mt-5 border-b border-gray-200">
              <div
                class="rounded mx-0.5 p-2 relative text-left select-none"
                classList={{
                  "bg-[#edf2f7] text-black":
                  curCoverRequest()?.shift?.published,
                  "bg-[repeating-linear-gradient(-45deg,white,white_5px,#eaf0f6_5px,#eaf0f6_10px)] border border-gray-200":
                    !curCoverRequest()?.shift?.published,
                }}
              >
                <i
                  class="absolute top-1 left-1.5 bottom-1 w-1.5 rounded"
                  classList={{
                    "bg-blue-500":
                      curCoverRequest()?.shift?.role === Role.CASHIER,
                    "bg-yellow-500":
                      curCoverRequest()?.shift?.role === Role.GUARD,
                    "bg-red-500":
                      curCoverRequest()?.shift?.role === Role.MANAGER,
                    "bg-gray-600":
                      curCoverRequest()?.shift?.role === Role.ADMIN,
                    "bg-gray-400":
                      curCoverRequest()?.shift?.role === Role.ALL_ROLES,
                  }}
                ></i>
                <p class="ml-3.5 font-semibold text-sm tracking-wider">
                  {shiftDetailsTime(
                    curCoverRequest()?.shift?.date || "",
                    curCoverRequest()?.shift?.startTime || "",
                    curCoverRequest()?.shift?.endTime || ""
                  )}
                </p>
                <p class="ml-3.5 font-normal text-xs tracking-wider">
                  {curCoverRequest()?.shift?.staff?.staffName} -{" "}
                  {capitalize(curCoverRequest()?.shift?.role || "")}
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
                    value={curCoverRequest()?.staffId || 0}
                    placeholder={"Select staff member"}
                    options={staffInfos()!
                      .map((staff) => ({
                        label: staff.staffName,
                        value: staff.staffId,
                      }))
                      .filter(
                        (staff) =>
                          staff.value !== curCoverRequest()?.shift?.staffId
                      )}
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
                    value={curCoverRequest()?.note || ""}
                    placeholder="e.g. Any other information you want to include with this shift cover request..."
                    formHandler={formHandler}
                  />
                  <TextArea
                    id="shiftId"
                    name="shiftId"
                    value={curCoverRequest()?.shiftId || 0}
                    hidden={true}
                    formHandler={formHandler}
                  />
                  <TextArea
                    id="shiftCoverRequestId"
                    name="shiftCoverRequestId"
                    value={curCoverRequest()?.shiftCoverRequestId || 0}
                    hidden={true}
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
                  onClick={[
                    onDelete,
                    curCoverRequest()?.shiftCoverRequestId || 0,
                  ]}
                  class="flex gap-2 justify-center items-center px-3 text-gray-500 text-sm hover:text-gray-700"
                >
                  <span>
                    <FaSolidTrash/>
                  </span>
                  <span>Delete</span>
                </button>
              </div>
              <div class="flex gap-2 justify-center items-center">
                <Show when={user()?.role === Role.ADMIN}>
                  <button
                    type="button"
                    disabled={updating.pending}
                    onClick={[
                      submit,
                      curCoverRequest()?.status ===
                      ShiftCoverRequestStatus.REJECTED
                        ? ShiftCoverRequestStatus.PENDING
                        : ShiftCoverRequestStatus.REJECTED,
                    ]}
                    class="py-1.5 px-3 font-semibold border text-sm rounded"
                    classList={{
                      "text-white border-red-600 bg-red-500 hover:bg-red-600":
                        curCoverRequest()?.status !==
                        ShiftCoverRequestStatus.REJECTED,
                      "text-gray-600 border-gray-300 bg-white hover:text-black":
                        curCoverRequest()?.status ===
                        ShiftCoverRequestStatus.REJECTED,
                    }}
                  >
                    {curCoverRequest()?.status ===
                    ShiftCoverRequestStatus.REJECTED
                      ? "Save & Reset"
                      : "Save & Deny"}
                  </button>
                  <button
                    type="button"
                    disabled={updating.pending}
                    onClick={[
                      submit,
                      curCoverRequest()?.status ===
                      ShiftCoverRequestStatus.APPROVED
                        ? ShiftCoverRequestStatus.PENDING
                        : ShiftCoverRequestStatus.APPROVED,
                    ]}
                    class="py-1.5 px-3 font-semibold border text-sm rounded"
                    classList={{
                      "text-white border-green-600 bg-green-500 hover:bg-green-600":
                        curCoverRequest()?.status !==
                        ShiftCoverRequestStatus.APPROVED,
                      "text-gray-600 border-gray-300 bg-white hover:text-black":
                        curCoverRequest()?.status ===
                        ShiftCoverRequestStatus.APPROVED,
                    }}
                  >
                    {curCoverRequest()?.status ===
                    ShiftCoverRequestStatus.APPROVED
                      ? "Save & Reset"
                      : "Save & Approve"}
                  </button>
                </Show>
                <button
                  type="button"
                  disabled={updating.pending}
                  onClick={[
                    submit,
                    curCoverRequest()?.status ||
                    ShiftCoverRequestStatus.PENDING,
                  ]}
                  class="py-1.5 px-3 font-semibold text-white border border-blue-600 bg-blue-500 text-sm rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </PopupModal.Footer>
        </div>
      </Show>
    </PopupModal.Wrapper>
  );
};

export default EditCoverRequestModal;
