import { Accessor, Component, Setter } from "solid-js";
import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import axios from "axios";
import * as yup from "yup";
import { Category, DataResponse } from "~/types";
import getEndPoint from "~/utils/getEndPoint";
import { createRouteAction } from "solid-start";
import handleFetchError from "~/utils/handleFetchError";
import { toastSuccess } from "~/utils/toast";
import PopupModal from "~/components/PopupModal";
import { TextInput } from "~/components/form/TextInput";
import { TextArea } from "~/components/form/TextArea";

type FormValues = {
  name: string;
  description?: string;
};

const schema: yup.Schema<FormValues> = yup.object({
  name: yup.string().required("Category name is required"),
  description: yup.string(),
});

const createCategory = async (formData: FormValues) => {
  try {
    const { data } = await axios.post<DataResponse<Category>>(`${getEndPoint()}/categories/add`, { ...formData });

    console.log(data);
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

const CreateCategoryModal: Component<{
  showModal: Accessor<boolean>;
  setShowModal: Setter<boolean>;
}> = ({ showModal, setShowModal }) => {
  const [ echoing, echo ] = createRouteAction(createCategory);
  const formHandler = useFormHandler(yupSchema(schema), { validateOn: [] });
  const { formData } = formHandler;

  const submit = async (e: Event) => {
    e.preventDefault();
    if (echoing.pending) return;

    const f = await formHandler.validateForm({ throwException: false });

    if (f.isFormInvalid) return;

    const success = await echo({ ...formData() });

    if (success) {
      toastSuccess("Category was created successfully");
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
      title="New Category"
      close={onCloseModal}
      open={showModal}
    >
      <div classList={{ "cursor-progress": echoing.pending }}>
        <PopupModal.Body>
          <form class="text-sm" onSubmit={submit}>
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="name"
                  name="name"
                  label="Category Name"
                  placeholder="e.g. Energy Drink"
                  formHandler={formHandler}
                />
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1 overflow-hidden">
                <TextArea
                  id="description"
                  name="description"
                  label="Description"
                  placeholder="Description of the category"
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

export default CreateCategoryModal;