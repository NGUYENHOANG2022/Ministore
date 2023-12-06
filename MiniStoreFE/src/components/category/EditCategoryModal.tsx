import PopupModal from "~/components/PopupModal";
import { Accessor, Component, createMemo, Setter } from "solid-js";
import { TextInput } from "~/components/form/TextInput";
import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import * as yup from "yup";
import { Category, DataResponse } from "~/types";
import { TextArea } from "~/components/form/TextArea";
import { createRouteAction } from "solid-start";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { toastSuccess } from "~/utils/toast";
import axios from "axios";
import { useRouteData } from "@solidjs/router";
import { useCategoryContext } from "~/context/Category";
import { routeData } from "~/routes/categories";

type FormValues = {
  categoryId: number;
  name: string;
  description?: string;
};

const schema: yup.Schema<FormValues> = yup.object({
  categoryId: yup.number().default(0),
  name: yup.string().required("Category name is required"),
  description: yup.string(),
});

const updateCategory = async (formData: FormValues) => {
  try {
    const { data } = await axios.put<DataResponse<Category>>(
      `${getEndPoint()}/categories/update/${formData.categoryId}`, { ...formData }
    );

    console.log(data);
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

const EditCategoryModal: Component<{
  showModal: Accessor<boolean>;
  setShowModal: Setter<boolean>;
}> = ({ setShowModal, showModal }) => {
  const { data } = useRouteData<typeof routeData>();
  const { chosenId } = useCategoryContext();
  const [ echoing, echo ] = createRouteAction(updateCategory);
  const formHandler = useFormHandler(yupSchema(schema), { validateOn: [] });
  const { formData } = formHandler;

  const category = createMemo(() => !data.error && data() !== undefined
    ? data()?.content.find((p) => p.categoryId === chosenId())
    : undefined
  )

  const submit = async (e: Event) => {
    e.preventDefault();
    if (echoing.pending) return;

    const f = await formHandler.validateForm({ throwException: false });

    if (f.isFormInvalid) return;

    const success = await echo({ ...formData() });

    if (success) {
      toastSuccess("Category was updated successfully");
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
      title="Edit Category"
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
                  label="Product Name"
                  value={category()?.name || ""}
                  placeholder="e.g. Energy Drink"
                  formHandler={formHandler}
                />
                <TextInput
                  id="categoryId"
                  name="categoryId"
                  hidden={true}
                  value={category()?.categoryId}
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
                  value={category()?.description || ""}
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
              Save
            </button>
          </div>
        </PopupModal.Footer>
      </div>
    </PopupModal.Wrapper>
  );
};

export default EditCategoryModal;
