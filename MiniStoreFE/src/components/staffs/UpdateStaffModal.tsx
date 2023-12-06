import PopupModal from "~/components/PopupModal";
import { Component, createMemo, Show } from "solid-js";
import { TextInput } from "~/components/form/TextInput";
import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import * as yup from "yup";
import { DataResponse, Role, Salary, Staff, StaffStatus } from "~/types";
import { createRouteAction } from "solid-start";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { toastSuccess } from "~/utils/toast";
import { useStaffContext } from "~/context/Staff";
import { Select } from "~/components/form/Select";
import moment from "moment";
import { useRouteData } from "@solidjs/router";
import { routeData } from "~/routes/staffs";
import axios from "axios";

interface UpdateStaff
  extends Omit<Staff, "salary" | "leaveRequests" | "shifts" | "image">,
    Omit<Salary, "staffId" | "salaryId" | "terminationDate"> {
}

const schema: yup.Schema<UpdateStaff> = yup.object({
  staffId: yup.number().required("Staff ID is required"),
  staffName: yup.string().required("Staff name is required"),
  role: yup
    .string()
    .oneOf([ Role.ADMIN, Role.MANAGER, Role.CASHIER, Role.GUARD ])
    .required("Role is required"),
  username: yup.string().required("Username is required"),
  phoneNumber: yup.string().default(""),
  status: yup
    .string()
    .oneOf([ StaffStatus.ACTIVATED, StaffStatus.DISABLED ])
    .required("Status is required"),
  email: yup.string().required("Email is required"),
  workDays: yup.string().default(""),
  leaveBalance: yup.number().required("Leave balance is required"),
  hourlyWage: yup.string().required("Hourly wage is required"),
  effectiveDate: yup.string().required("Effective date is required"),
});

const updateStaff = async (formData: UpdateStaff) => {
  try {
    const { data } = await axios.put<DataResponse<Staff>>(
      `${getEndPoint()}/staffs/${formData.staffId}/edit`,
      { ...formData }
    );
    console.log(data);
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

const UpdateStaffModal: Component = () => {
  const { data } = useRouteData<typeof routeData>();
  const [ echoing, echo ] = createRouteAction(updateStaff);
  const { setShowEditModal, showEditModal, chosenId } = useStaffContext();
  const formHandler = useFormHandler(yupSchema(schema), { validateOn: [] });
  const { formData } = formHandler;

  const staff = createMemo(() =>
    !data.error && data() !== undefined
      ? data()?.content.find((t) => t.staffId === chosenId())
      : undefined
  );

  const submit = async (e: Event) => {
    e.preventDefault();
    if (echoing.pending) return;

    const f = await formHandler.validateForm();
    console.log(formData(), formHandler.getFormErrors());

    if (f.isFormInvalid) return;

    const success = await echo({ ...formData() });

    if (success) {
      toastSuccess("Staff is updated successfully");
      await formHandler.resetForm();
      setShowEditModal(false);
    }
  };

  const onCloseModal = async () => {
    await formHandler.resetForm();
    setShowEditModal(false);
  };

  return (
    <PopupModal.Wrapper
      title="New Staff"
      close={onCloseModal}
      open={showEditModal}
      width="750px"
    >
      <Show when={staff() !== undefined}>
        <div classList={{ "cursor-progress": echoing.pending }}>
          <PopupModal.Body>
            <form class="text-sm" onSubmit={submit}>
              <div class="flex gap-2">
                <div class="flex-1 py-2.5 flex flex-col gap-1">
                  <TextInput
                    id="staffName"
                    name="staffName"
                    label="Staff Name"
                    value={staff()?.staffName}
                    placeholder="Enter staff name"
                    formHandler={formHandler}
                  />
                  <TextInput
                    id="staffId"
                    name="staffId"
                    hidden={true}
                    value={staff()?.staffId}
                    formHandler={formHandler}
                  />
                </div>
                <div class="flex-1 py-2.5 flex flex-col gap-1">
                  <TextInput
                    id="username"
                    name="username"
                    label="Username"
                    value={staff()?.username}
                    placeholder="Enter staff username"
                    formHandler={formHandler}
                  />
                </div>
                <div class="flex-1 py-2.5 flex flex-col gap-1">
                  <Select
                    id="role"
                    name="role"
                    label="Role"
                    value={staff()?.role}
                    options={[
                      { value: Role.ADMIN, label: "Admin" },
                      { value: Role.MANAGER, label: "Manager" },
                      { value: Role.CASHIER, label: "Cashier" },
                      { value: Role.GUARD, label: "Guard" },
                    ]}
                    formHandler={formHandler}
                  />
                  <TextInput
                    id="status"
                    name="status"
                    hidden={true}
                    value={staff()?.status}
                    formHandler={formHandler}
                  />
                  <TextInput
                    id="leaveBalance"
                    name="leaveBalance"
                    hidden={true}
                    value={staff()?.leaveBalance}
                    type="number"
                    formHandler={formHandler}
                  />
                </div>
              </div>
              <div class="flex gap-2">
                <div class="flex-1 py-2.5 flex flex-col gap-1">
                  <TextInput
                    id="phoneNumber"
                    name="phoneNumber"
                    label="Phone Number"
                    value={staff()?.phoneNumber}
                    placeholder="Enter phone number"
                    formHandler={formHandler}
                  />
                </div>
                <div class="flex-1 py-2.5 flex flex-col gap-1">
                  <TextInput
                    id="email"
                    name="email"
                    label="Email"
                    value={staff()?.email}
                    placeholder="Enter staff email"
                    formHandler={formHandler}
                  />
                </div>
              </div>
              <div class="flex gap-2">
                <div class="flex-1 py-2.5 flex flex-col gap-1">
                  <TextInput
                    id="hourlyWage"
                    name="hourlyWage"
                    label="Hourly Wage"
                    type="number"
                    value={staff()?.salary?.hourlyWage}
                    placeholder="Enter hourly wage (VND)"
                    formHandler={formHandler}
                  />
                  <TextInput
                    id="effectiveDate"
                    name="effectiveDate"
                    hidden={true}
                    type="date"
                    value={moment().format("YYYY-MM-DD")}
                    formHandler={formHandler}
                  />
                </div>
                <div class="flex-1 py-2.5 flex flex-col gap-1">
                  <TextInput
                    id="workDays"
                    name="workDays"
                    label="Work days"
                    value={staff()?.workDays}
                    placeholder="Enter staff work days (e.g MON, WED, SAT)"
                    formHandler={formHandler}
                  />
                </div>
              </div>
            </form>
          </PopupModal.Body>
          <PopupModal.Footer>
            <div class="w-full flex justify-end items-center gap-2">
              <button
                type="button"
                disabled={echoing.pending}
                onClick={submit}
                class="py-1.5 px-3 font-semibold text-white border border-blue-600 bg-blue-500 text-sm rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </PopupModal.Footer>
        </div>
      </Show>
    </PopupModal.Wrapper>
  );
};

export default UpdateStaffModal;
