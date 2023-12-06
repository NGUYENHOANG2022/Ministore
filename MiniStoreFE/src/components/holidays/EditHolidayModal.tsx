import PopupModal from "~/components/PopupModal";
import { Component, createMemo } from "solid-js";
import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import * as yup from "yup";
import { DataResponse, Holiday, ShiftCoverRequest } from "~/types";
import { createRouteAction } from "solid-start";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { toastSuccess } from "~/utils/toast";
import { useRouteData } from "@solidjs/router";
import { routeData } from "~/routes/holidays";
import { useHContext } from "~/context/Holiday";
import { TextInput } from "~/components/form/TextInput";
import { FaSolidTrash } from "solid-icons/fa";
import axios from "axios";

const schema: yup.Schema<Holiday> = yup.object({
  holidayId: yup.number().required("Holiday ID is required"),
  name: yup.string().required("Holiday name is required"),
  startDate: yup.string().required("Start date is required"),
  endDate: yup.string().required("End date is required"),
  coefficient: yup.number().default(3),
});

const updateHoliday = async (formData: Holiday) => {
  try {
    const { data } = await axios.put<DataResponse<ShiftCoverRequest>>(
      `${getEndPoint()}/holidays/update/${formData.holidayId}`,
      { ...formData }
    );
    console.log(data);
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

const EditHolidayModal: Component = () => {
  const [ updating, updateAction ] = createRouteAction(updateHoliday);
  const { data } = useRouteData<typeof routeData>();
  const { chosenId, onDelete, setShowEditModal, showEditModal } = useHContext();

  const formHandler = useFormHandler(yupSchema(schema), { validateOn: [] });
  const { formData } = formHandler;

  const curHoliday = createMemo(() =>
    !data.error && data() !== undefined
      ? data()?.content.find((sc) => sc.holidayId === chosenId())
      : undefined
  );

  const submit = async (e: Event) => {
    e.preventDefault();
    if (updating.pending) return;

    const f = await formHandler.validateForm({ throwException: false });

    console.log(f);
    if (f.isFormInvalid) return;

    const success = await updateAction({ ...formData() });

    if (success) {
      toastSuccess("Shift cover request updated successfully");
      setShowEditModal(false);
    }
  };

  const onCloseModal = async () => {
    await formHandler.resetForm();
    setShowEditModal(false);
  };

  return (
    <PopupModal.Wrapper
      title="Edit Holiday"
      close={onCloseModal}
      open={showEditModal}
    >
      <div
        classList={{
          "cursor-progress": updating.pending,
        }}
      >
        <PopupModal.Body>
          <form class="text-sm" onSubmit={submit}>
            <div class="flex">
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="name"
                  name="name"
                  label="Holiday Name"
                  placeholder="Holiday name"
                  value={curHoliday()?.name}
                  formHandler={formHandler}
                />
                <TextInput
                  id="holidayId"
                  name="holidayId"
                  hidden={true}
                  value={curHoliday()?.holidayId}
                  formHandler={formHandler}
                />
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="startDate"
                  name="startDate"
                  label="Start Date"
                  type="date"
                  placeholder="Select a date"
                  value={curHoliday()?.startDate}
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
                  value={curHoliday()?.endDate}
                  formHandler={formHandler}
                />
              </div>
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="coefficient"
                  name="coefficient"
                  type="number"
                  label="Coefficient"
                  placeholder="Coefficient"
                  value={curHoliday()?.coefficient}
                  step={0.1}
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
                onClick={[ onDelete, curHoliday()?.holidayId ]}
                class="flex gap-2 justify-center items-center text-gray-500 text-sm hover:text-gray-700"
              >
                <span>
                  <FaSolidTrash/>
                </span>
                <span>Delete</span>
              </button>
            </div>
            <div class="w-full flex justify-end items-center gap-2">
              <button
                type="button"
                disabled={updating.pending}
                onClick={submit}
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

export default EditHolidayModal;
