import PopupModal from "~/components/PopupModal";
import { Component } from "solid-js";
import { TextInput } from "~/components/form/TextInput";
import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import * as yup from "yup";
import { DataResponse, Role, Salary, Staff, StaffStatus } from "~/types";
import { createRouteAction } from "solid-start";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { toastError, toastSuccess } from "~/utils/toast";
import { useStaffContext } from "~/context/Staff";
import { Select } from "~/components/form/Select";
import moment from "moment";
import axios from "axios";

interface CreateStaff
  extends Omit<
    Staff,
    "staffId" | "salary" | "leaveRequests" | "shifts" | "image"
  >,
    Omit<Salary, "staffId" | "salaryId" | "terminationDate"> {
  confirmPassword: string;
}

const schema: yup.Schema<CreateStaff> = yup.object({
  staffName: yup.string().required("Staff name is required"),
  role: yup
    .string()
    .oneOf([ Role.ADMIN, Role.MANAGER, Role.CASHIER, Role.GUARD ])
    .required("Role is required"),
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
  confirmPassword: yup.string().required("Confirm password is required"),
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

const createStaff = async (formData: CreateStaff) => {
  try {
    const { data } = await axios.post<DataResponse<Staff>>(
      `${getEndPoint()}/staffs/add`,
      { ...formData }
    );
    console.log(data);
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

const CreateStaffModal: Component = () => {
  const [ echoing, echo ] = createRouteAction(createStaff);
  const { setShowCreateModal, showCreateModal } = useStaffContext();
  const formHandler = useFormHandler(yupSchema(schema), { validateOn: [] });
  const { formData } = formHandler;

  const submit = async (e: Event) => {
    e.preventDefault();
    if (echoing.pending) return;

    const f = await formHandler.validateForm();
    console.log(formData(), formHandler.getFormErrors());

    if (f.isFormInvalid) return;

    if (formData().confirmPassword !== formData().password) {
      toastError("Confirm password is not matching the password");
      return;
    }

    const success = await echo({ ...formData() });

    if (success) {
      toastSuccess("Staff is created successfully");
      await formHandler.resetForm();
      setShowCreateModal(false);
    }
  };

  const onCloseModal = async () => {
    await formHandler.resetForm();
    setShowCreateModal(false);
  };

  return (
    <PopupModal.Wrapper
      title="New Staff"
      close={onCloseModal}
      open={showCreateModal}
      width="750px"
    >
      <div classList={{ "cursor-progress": echoing.pending }}>
        <PopupModal.Body>
          <form class="text-sm" onSubmit={submit}>
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="staffName"
                  name="staffName"
                  label="Staff Name"
                  placeholder="Enter staff name"
                  formHandler={formHandler}
                />
              </div>
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="username"
                  name="username"
                  label="Username"
                  placeholder="Enter staff username"
                  formHandler={formHandler}
                />
              </div>
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <Select
                  id="role"
                  name="role"
                  label="Role"
                  value={Role.CASHIER}
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
                  value={StaffStatus.ACTIVATED}
                  formHandler={formHandler}
                />
                <TextInput
                  id="leaveBalance"
                  name="leaveBalance"
                  hidden={true}
                  value={14}
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
                  placeholder="Enter phone number"
                  formHandler={formHandler}
                />
              </div>
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="email"
                  name="email"
                  label="Email"
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
                  placeholder="Enter staff work days (e.g MON, WED, SAT)"
                  formHandler={formHandler}
                />
              </div>
            </div>
            <div class="flex gap-2 border-t border-gray-300 border-dotted mt-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  autocomplete="off"
                  placeholder="Enter staff password"
                  formHandler={formHandler}
                />
              </div>
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  autocomplete="off"
                  type="password"
                  placeholder="Re-enter staff password"
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
              Create
            </button>
          </div>
        </PopupModal.Footer>
      </div>
    </PopupModal.Wrapper>
  );
};

export default CreateStaffModal;
