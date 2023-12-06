import { Accessor, batch, Component, createResource, createSignal, ResourceFetcher, Setter, } from "solid-js";
import PopupModal from "../PopupModal";
import { DataResponse, Role, Shift, ShiftTemplate, Staff } from "~/types";
import { Select } from "../form/Select";
import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import * as yup from "yup";
import { TextInput } from "../form/TextInput";
import { readableToTimeStr, shiftTimes } from "./utils/shiftTimes";
import { capitalize } from "~/utils/capitalize";
import { useSPData } from "~/context/ShiftPlanning";
import { timeOptions, transformTimeString } from "./utils/timeOptions";
import { roles } from "~/utils/roles";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import ResourceWrapper from "~/components/ResourceWrapper";
import { getShiftRules } from "~/components/shift-planning/utils/shiftRules";
import moment from "moment";
import isDayInThePast from "~/utils/isDayInThePast";
import { cellIdGenerator } from "~/components/shift-planning/utils/cellIdGenerator";
import { sortBy } from "lodash";
import { toastSuccess } from "~/utils/toast";
import axios from "axios";

type NewScheduleForm = {
  shiftTemplateId?: number;
  staffId: number;
  startTime: string;
  endTime: string;
  salaryCoefficient: number;
  name: string;
  role: Role;
  date: Date;
};

const validTimeOptions = timeOptions().map((item) => item.value);
const schema: yup.Schema<NewScheduleForm> = yup.object({
  shiftTemplateId: yup.number().typeError("Invalid shift template"),
  staffId: yup
    .number()
    .min(1, "Please select a staff")
    .required("Please select a staff"),
  name: yup.string().required("Please give this shift a name"),
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

const fetcher: ResourceFetcher<
  boolean,
  ShiftTemplate[],
  { state: "list" | "edit" | "create" }
> = async () => {
  try {
    const response = await axios.get<DataResponse<ShiftTemplate[]>>(
      `${getEndPoint()}/shift-templates`
    );
    return response.data.content;
  } catch (e: any) {
    throw new Error(handleFetchError(e));
  }
};

const NewShiftModal: Component<{
  showModal: Accessor<boolean>;
  modalData: Accessor<{ staff: Staff; date: string } | undefined>;
  setShowModal: Setter<boolean>;
}> = ({ showModal, modalData, setShowModal }) => {
  const { tableData, setTableData } = useSPData();
  const [ shiftTemplates ] = createResource(showModal, fetcher);
  const [ chosenTemplate, setChosenTemplate ] = createSignal<number>(0);
  const [ creating, setCreating ] = createSignal(false);

  const formHandler = useFormHandler(yupSchema(schema), {
    validateOn: [ "blur" ],
  });
  const { formData, setFieldValue } = formHandler;

  const submit = async (publish: boolean, event: Event) => {
    event.preventDefault();
    if (creating()) return;

    try {
      const f = await formHandler.validateForm({ throwException: false });
      if (f.isFormInvalid) return;

      setCreating(true);
      const dateStr = moment(formData().date).format("YYYY-MM-DD");
      const staff = tableData.staffs.find(
        (staff) => staff.staffId === formData().staffId
      );

      // If the date is in the past, throw an error
      if (isDayInThePast(dateStr))
        throw new Error("Can not create shift in the past");

      // If the staff is not found, throw an error
      if (!staff) throw new Error("Invalid staff");

      // Check if the shift is valid
      const notPassedRules = getShiftRules(
        { ...formData(), shiftId: 0, published: publish, date: dateStr },
        {
          staff,
          date: dateStr,
        },
        tableData
      ).filter((rule) => !rule.passed);
      if (notPassedRules.length > 0)
        throw new Error(notPassedRules[0].errorName);

      // Create the shift
      const { data } = await axios.post<DataResponse<Shift>>(
        `${getEndPoint()}/shifts/add`,
        {
          ...formData(),
          startTime: readableToTimeStr(formData().startTime),
          endTime: readableToTimeStr(formData().endTime),
          published: publish,
        }
      );
      console.log(data);
      if (!data) throw new Error("Invalid response from server");

      // Update the table data. Add a new shift to the cell of that day
      // NOTE: Cells must be updated at last, because we need to set the new shift data first
      batch(() => {
        setTableData("shifts", data.content.shiftId, data.content);
        setTableData("cells", cellIdGenerator(staff, dateStr), (shiftIds) => {
          const sortedShifts = sortBy(
            [ ...shiftIds, data.content.shiftId ],
            [ (shiftId) => tableData.shifts[shiftId].startTime ]
          );
          return [ ...sortedShifts ];
        });
      });

      toastSuccess("Shift created successfully");
      reset();
      setShowModal(false);
    } catch (error: any) {
      handleFetchError(error);
    } finally {
      setCreating(false);
    }
  };

  const reset = () => {
    formHandler.resetForm();
  };

  const shiftTemplateOptions = () => {
    return shiftTemplates()?.map((shift) => ({
      value: shift.shiftTemplateId,
      label: `${shift.name} (${shiftTimes(shift.startTime, shift.endTime)}) [${
        shift.role === Role.ALL_ROLES
          ? "All roles"
          : capitalize(shift.role) + " only"
      }]`,
    }));
  };

  const onChangeTemplate = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    setChosenTemplate(Number.parseInt(target.value));
    const template = shiftTemplates()?.find(
      (shift) => shift.shiftTemplateId === chosenTemplate()
    );
    if (!template) {
      setFieldValue("salaryCoefficient", 1);
      setFieldValue("role", modalData()?.staff.role);
      setFieldValue("startTime", 0, { validate: false });
      setFieldValue("endTime", 0, { validate: false });
      setFieldValue("name", "", { validate: false });
      setFieldValue("date", modalData()?.date);
      setFieldValue("staffId", modalData()?.staff.staffId);
      return;
    }

    const coefficient = template.salaryCoefficient;
    const role = template.role;
    const startTime = template.startTime;
    const endTime = template.endTime;
    const name = template.name;

    setFieldValue("salaryCoefficient", coefficient);
    setFieldValue("role", role);
    setFieldValue("startTime", startTime);
    setFieldValue("endTime", endTime);
    setFieldValue("name", name);
  };

  const onCloseModal = () => {
    reset();
    setShowModal(false);
    setChosenTemplate(0);
  };

  return (
    <PopupModal.Wrapper title="New Shift" close={onCloseModal} open={showModal}>
      <ResourceWrapper data={shiftTemplates}>
        <div
          classList={{
            "cursor-progress": creating(),
          }}
        >
          <PopupModal.Body>
            <form class="text-sm" onSubmit={[ submit, false ]}>
              <div class="flex">
                <div class="flex-1 py-2.5 flex flex-col gap-1">
                  <label
                    for="shiftTemplateId"
                    class="text-gray-700 font-semibold"
                  >
                    Shift Template
                  </label>
                  <Select
                    id="shiftTemplateId"
                    name="shiftTemplateId"
                    value={0}
                    placeholder="No Shift Template"
                    options={shiftTemplateOptions()}
                    onChange={onChangeTemplate}
                    formHandler={formHandler}
                  />
                </div>
              </div>
              <div class="flex gap-2">
                <div class="flex-1 py-2.5 flex flex-col gap-1">
                  <label for="staffId" class="text-gray-700 font-semibold">
                    Staff Members
                  </label>
                  <Select
                    id="staffId"
                    name="staffId"
                    value={modalData()?.staff.staffId || 0}
                    placeholder="Select a staff member"
                    options={tableData.staffs.map((staff) => ({
                      value: staff.staffId,
                      label: staff.staffName,
                    }))}
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
                    disabled={chosenTemplate() !== 0}
                    value={1}
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
                    value={
                      shiftTemplates()?.find(
                        (t) => t.shiftTemplateId === chosenTemplate()
                      )?.name || ""
                    }
                    formHandler={formHandler}
                    disabled={chosenTemplate() !== 0}
                  />
                </div>
                <div class="flex-1 py-2.5 flex flex-col gap-1">
                  <label for="role" class="text-gray-700 font-semibold">
                    Required Role
                  </label>
                  <Select
                    id="role"
                    name="role"
                    value={modalData()?.staff.role || Role.ALL_ROLES}
                    options={roles}
                    formHandler={formHandler}
                    disabled={chosenTemplate() !== 0}
                  />
                </div>
              </div>
              <div class="flex gap-2">
                <div class="flex-1 py-2.5 flex flex-col gap-1 overflow-hidden">
                  <label for="date" class="text-gray-700 font-semibold">
                    Date
                  </label>
                  <TextInput
                    id="date"
                    name="date"
                    type="date"
                    value={modalData()?.date || ""}
                    formHandler={formHandler}
                  />
                </div>
                <div class="flex-1 py-2.5 flex flex-col gap-1">
                  <label for="startTime" class="text-gray-700 font-semibold">
                    Start Time
                  </label>
                  <Select
                    id="startTime"
                    name="startTime"
                    value={0}
                    placeholder="Select Start Time"
                    options={timeOptions()}
                    formHandler={formHandler}
                    onChange={() =>
                      setFieldValue("endTime", 0, { validate: false })
                    }
                    disabled={chosenTemplate() !== 0}
                  />
                </div>
                <div class="flex-1 py-2.5 flex flex-col gap-1">
                  <label for="endTime" class="text-gray-700 font-semibold">
                    End Time
                  </label>
                  <Select
                    id="endTime"
                    name="endTime"
                    value={0}
                    placeholder="Select End Time"
                    options={timeOptions(
                      transformTimeString(formData().startTime)
                    )}
                    formHandler={formHandler}
                    disabled={
                      formData().startTime == "0" || chosenTemplate() !== 0
                    }
                  />
                </div>
              </div>
            </form>
          </PopupModal.Body>
          <PopupModal.Footer>
            <div class="w-full flex justify-end items-center gap-2">
              <button
                type="button"
                disabled={creating()}
                onClick={[ submit, true ]}
                class="py-1.5 px-3 font-semibold text-gray-600 border border-gray-300 text-sm rounded hover:text-black"
              >
                Create & Publish
              </button>
              <button
                type="button"
                disabled={creating()}
                onClick={[ submit, false ]}
                class="py-1.5 px-3 font-semibold text-white border border-blue-600 bg-blue-500 text-sm rounded hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </PopupModal.Footer>
        </div>
      </ResourceWrapper>
    </PopupModal.Wrapper>
  );
};

export default NewShiftModal;
