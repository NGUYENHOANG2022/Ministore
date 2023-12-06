import PopupModal from "~/components/PopupModal";
import { Accessor, Component, createMemo, Setter } from "solid-js";
import { TextInput } from "~/components/form/TextInput";
import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import * as yup from "yup";
import { DataResponse, Product, } from "~/types";
import { TextArea } from "~/components/form/TextArea";
import { createRouteAction } from "solid-start";
import getEndPoint from "~/utils/getEndPoint";
import { Select } from "~/components/form/Select";
import handleFetchError from "~/utils/handleFetchError";
import { toastSuccess } from "~/utils/toast";
import axios from "axios";
import { useRouteData } from "@solidjs/router";
import { routeData } from "~/routes/products";
import { useProductContext } from "~/context/Product";

type UpdateProduct = {
  productId: number;
  name: string;
  description?: string;
  barCode?: string;
  price: number;
  inventory: number;
  categoryId?: number;
};

const schema: yup.Schema<UpdateProduct> = yup.object({
  productId: yup.number().default(0),
  name: yup.string().required("Product name is required"),
  description: yup.string().default(""),
  barCode: yup.string().default(""),
  price: yup.number().min(0, "Smallest price is 0").required("Price is required"),
  inventory: yup.number().min(0, "Smallest amount is 0").required("Inventory is required"),
  categoryId: yup.number().default(0),
});

const updateProduct = async (formData: UpdateProduct) => {
  try {
    const { data } = await axios.put<DataResponse<Product>>(
      `${getEndPoint()}/products/update/${formData.productId}`,
      { ...formData }
    );

    console.log(data);
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

const EditProductModal: Component<{
  showModal: Accessor<boolean>;
  setShowModal: Setter<boolean>;
}> = ({ setShowModal, showModal }) => {
  const { data, categories } = useRouteData<typeof routeData>();
  const { chosenId } = useProductContext();
  const [ echoing, echo ] = createRouteAction(updateProduct);
  const formHandler = useFormHandler(yupSchema(schema), { validateOn: [] });
  const { formData } = formHandler;

  const product = createMemo(() => !data.error && data() !== undefined
    ? data()?.content.find((p) => p.productId === chosenId())
    : undefined
  )

  const categoryList = createMemo(() => !categories.error && categories() !== undefined ?
    categories()?.map(c => ({ label: c.name, value: c.categoryId })) : []
  )

  const submit = async (e: Event) => {
    e.preventDefault();
    if (echoing.pending) return;

    const f = await formHandler.validateForm({ throwException: false });

    if (f.isFormInvalid) return;

    const success = await echo({ ...formData() });

    if (success) {
      toastSuccess("Product was updated successfully");
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
      title="Edit Product"
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
                  value={product()?.name || ""}
                  placeholder="e.g. iPhone 12 Pro Max"
                  formHandler={formHandler}
                />
                <TextInput
                  id="productId"
                  name="productId"
                  hidden={true}
                  value={product()?.productId}
                  formHandler={formHandler}
                />
              </div>
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="barCode"
                  name="barCode"
                  label="Barcode"
                  value={product()?.barCode || ""}
                  placeholder="e.g. 123456789"
                  formHandler={formHandler}
                />
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="price"
                  name="price"
                  label="Price"
                  type="number"
                  value={product()?.price || 0}
                  step={500}
                  placeholder="Enter price (VND)"
                  formHandler={formHandler}
                />
              </div>
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <TextInput
                  id="inventory"
                  name="inventory"
                  label="Inventory"
                  type="number"
                  value={product()?.inventory || 0}
                  placeholder="Enter inventory"
                  formHandler={formHandler}
                />
              </div>
              <div class="flex-1 py-2.5 flex flex-col gap-1">
                <Select
                  id="categoryId"
                  name="categoryId"
                  label="Category"
                  value={product()?.categoryId || 0}
                  placeholder="Select category"
                  options={categoryList()}
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
                  value={product()?.description || ""}
                  placeholder="Description of the product"
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

export default EditProductModal;
