import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import Breadcrumbs from "~/components/Breadcrumbs";
import { TextInput } from "~/components/form/TextInput";
import routes from "~/utils/routes";
import * as yup from "yup";
import { Select } from "~/components/form/Select";
import { RiSystemAddFill } from "solid-icons/ri";
import { CgClose } from "solid-icons/cg";
import axios from "axios";
import {Category, Product} from "~/types";
import getEndPoint from "~/utils/getEndPoint";
import {createEffect, createSignal} from "solid-js";
import {toastError, toastSuccess} from "~/utils/toast";

type FormValues = {
  name: string;
  description?: string;
  price: number;
  barCode?: string;
  categoryId?: number;
  inventory?: number
};

const schema: yup.Schema<FormValues> = yup.object({
  name: yup.string().required("Vui lòng nhập tên sản phẩm"),
  description: yup.string(),
  price: yup
    .number()
    .typeError("Dữ liệu không hợp lệ")
    .min(0, "Giá sản phẩm không được nhỏ hơn 0")
    .max(1000000, "Giá sản phẩm không được vượt quá 1 triệu")
    .required("Vui lòng nhập giá sản phẩm"),
  barCode: yup.string(),
  categoryId: yup.number(),
  inventory: yup.number(),
});

export default function AddProduct() {
  const formHandler = useFormHandler(yupSchema(schema), {
    validateOn: ["change"],
  });
  const { formData } = formHandler;

  const submit = async (event: Event) => {
    event.preventDefault();
    try {
      await formHandler.validateForm();
      const {categoryId, ...productData} = formData();

      const productWithCategory = {
        ...productData,
        ...(categoryId ? { category: { categoryId } } : {}),
      };

      await axios.post<Product>(`${getEndPoint()}/products/add`, productWithCategory);
      toastSuccess("Product created successfully!");
    } catch (error) {
      toastError("Error when create Product");
      console.error(error);
    }
  };

  const reset = () => {
    formHandler.resetForm();
  };

  const [categories, setCategories] = createSignal<Category[]>();

  createEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<Category[]>(`${getEndPoint()}/categories/list`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  });

  return (
    <main>
      <h1 class="mb-2 text-2xl font-medium">Add Product</h1>
      <Breadcrumbs
        linkList={[
          { name: "Product List", link: routes.products },
          { name: "Add Product" },
        ]}
      />

      <form class="flex flex-row gap-6 mb-4" onSubmit={submit}>
        <div class="flex-1 min-w-[800px] space-y-6">
          <div class="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h4 class="mb-3.5 text-lg font-medium text-gray-600">
              General Information
            </h4>
            <div class="space-y-2">
              <TextInput
                id="productName"
                name="name"
                label="Product Name"
                placeholder="Type product name here"
                formHandler={formHandler}
              />
              <TextInput
                id="description"
                name="description"
                label="Description"
                placeholder="Type product description here"
                formHandler={formHandler}
              />
              <TextInput
                id="price"
                type="number"
                min={0}
                step={1000}
                value={0}
                name="price"
                label="Price (VND)"
                placeholder="Type product price here"
                formHandler={formHandler}
              />
            </div>
          </div>
          <div class="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h4 class="mb-3.5 text-lg font-medium text-gray-600">Inventory</h4>
            <div class="flex flex-row gap-3.5 justify-stretch items-center">
              <TextInput
                id="barcode"
                name="barCode"
                label="Barcode"
                placeholder="Product barcode"
                formHandler={formHandler}
                classList={{ "flex-1": true }}
              />
              <TextInput
                id="inventory"
                type="number"
                min={0}
                value={0}
                name="inventory"
                label="Inventory"
                placeholder="Inventory"
                formHandler={formHandler}
                classList={{ "flex-1": true }}
              />
            </div>
          </div>
          <div class="pb-4 flex flex-row justify-end items-center gap-3">
            <button
              type="button"
              onClick={reset}
              class="flex gap-1 justify-center items-center pl-3 pr-4 py-2 text-sm text-gray-500 bg-white border border-gray-500 font-medium rounded-lg hover:border-black hover:text-black"
            >
              <span class="text-lg">
                <CgClose />
              </span>
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              class="flex gap-1 justify-center items-center pl-3 pr-4 py-2 text-sm text-white bg-indigo-500 border border-indigo-500 font-medium rounded-lg hover:bg-indigo-600"
            >
              <span class="text-lg">
                <RiSystemAddFill />
              </span>
              <span>Create new product</span>
            </button>
          </div>
        </div>
        <div class="w-60">
          <div class="p-6 mb-8 bg-white rounded-lg shadow-md border border-gray-200">
            <h4 class="mb-3.5 text-lg font-medium text-gray-600">Category</h4>
            <div>
              <Select
                id="category"
                name="categoryId"
                label="Product Category"
                value={0}
                options={[
                  { value: 0, label: "Select a category" },
                  ...(categories() || []).map((category) => ({
                    value: category.categoryId,
                    label: category.name,
                  })),
                ]}
                formHandler={formHandler}
              />
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
