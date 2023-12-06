import PopupModal from "~/components/PopupModal";
import { Component } from "solid-js";
import { TextInput } from "~/components/form/TextInput";
import { useAuth } from "~/context/Auth";
import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import * as yup from "yup";
import { DataResponse, Holiday } from "~/types";
import { createRouteAction } from "solid-start";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { toastError, toastSuccess } from "~/utils/toast";
import moment from "moment";
import { useHContext } from "~/context/Holiday";
import axios from "axios";

type CreateHoliday = {
  name: string;
  startDate: string;
  endDate: string;
  coefficient: number;
};

const schema: yup.Schema<CreateHoliday> = yup.object({
  name: yup.string().required("Holiday name is required"),
  startDate: yup.string().required("Start date is required"),
  endDate: yup.string().required("End date is required"),
  coefficient: yup.number().default(3),
});

const createHoliday = async (formData: Omit<Holiday, "holidayId">) => {
  try {
    const { data } = await axios.post<DataResponse<Holiday>>(
      `${getEndPoint()}/holidays/add`,
      { ...formData }
    );
    console.log(data);
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

const CreateHolidayModal: Component = () => {
  const [ echoing, echo ] = createRouteAction(createHoliday);
  const { setShowCreateModal, showCreateModal } = useHContext();
  const { user } = useAuth();
  const formHandler = useFormHandler(yupSchema(schema), { validateOn: [] });
  const { formData } = formHandler;

  const submit = async (e: Event) => {
    e.preventDefault();
    if (echoing.pending) return;

    const f = await formHandler.validateForm({ throwException: false });

    if (f.isFormInvalid) return;

    if (moment(formData().startDate, "YYYY-MM-DD").isAfter(formData().endDate))
      return toastError("Start date cannot be greater than end date");

    const success = await echo({ ...formData() });

    if (success) {
      toastSuccess("Holiday created successfully");
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
      title="New Holiday"
      close={onCloseModal}
      open={showCreateModal}
    >
      <div classList={{ "cursor-progress": echoing.pending }}>
        <PopupModal.Body>
          <form class="text-sm" onSubmit={submit}>
            <div class="flex">
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="name"
                  name="name"
                  label="Holiday Name"
                  placeholder="Holiday name"
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
                <TextInput
                  id="coefficient"
                  name="coefficient"
                  type="number"
                  label="Coefficient"
                  value={3}
                  step={0.1}
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

export default CreateHolidayModal;
