import { useRouteData } from "@solidjs/router";
import { createSignal } from "solid-js";
import { createRouteAction, createRouteData, useSearchParams } from "solid-start";
import Breadcrumbs from "~/components/Breadcrumbs";
import Pagination from "~/components/Pagination";
import { Category, DataResponse, PageResponse, Product } from "~/types";
import handleFetchError from "~/utils/handleFetchError";
import axios from "axios";
import getEndPoint from "~/utils/getEndPoint";
import { ParamType } from "~/components/products/types";
import ToolBar from "~/components/products/ToolBar";
import { toastSuccess } from "~/utils/toast";
import { ModalContext } from "~/context/Product";
import Table from "~/components/products/Table";
import CreateProductModal from "~/components/products/CreateProductModal";
import EditProductModal from "~/components/products/EditProductModal";

const deleteProduct = async (id: number) => {
  try {
    const { data } = await axios.delete<DataResponse<Product>>(
      `${getEndPoint()}/products/delete/${id}`
    );
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

export function routeData() {
  const [ searchParams ] = useSearchParams<ParamType>();

  const products = createRouteData(
    async ([ key, perPage, curPage, search ]) => {
      try {
        const uri = new URLSearchParams({ perPage, curPage, search });

        const { data } = await axios.get<DataResponse<PageResponse<Product>>>(
          `${getEndPoint()}/${key}?${uri.toString()}`
        );
        return data.content;
      } catch (e) {
        throw new Error(handleFetchError(e));
      }
    },
    {
      key: () => [ "products", searchParams.perPage ?? "10", searchParams.curPage ?? "1", searchParams.search ?? "" ],
      reconcileOptions: { key: "content.productId" }
    }
  );

  const categories = createRouteData(
    async ([ key ]) => {
      try {

        const { data } = await axios.get<DataResponse<Category[]>>(`${getEndPoint()}/${key}/all`);
        return data.content;
      } catch (e) {
        throw new Error(handleFetchError(e));
      }
    },
    {
      key: () => [ "categories" ],
      reconcileOptions: { key: "categoryId" }
    }
  );

  return { data: products, categories };
}

export default function Products() {
  const { data } = useRouteData<typeof routeData>();
  const [ showCreateModal, setShowCreateModal ] = createSignal(false);
  const [ showEditModal, setShowEditModal ] = createSignal(false);
  const [ chosenId, setChosenId ] = createSignal(0);
  const [ deleting, deleteAction ] = createRouteAction(deleteProduct);

  const totalItems = () => (data.error ? 0 : data()?.totalElements ?? 0);

  const onDelete = async (id: number) => {
    if (deleting.pending) return;
    if (!confirm("Are you sure you want to delete this product?"))
      return;

    const success = await deleteAction(id);
    if (!success) return;

    if (showEditModal()) setShowEditModal(false);
    toastSuccess("Product was deleted successfully");
  };

  return (
    <main>
      <ModalContext.Provider value={{
        showCreateModal,
        setShowCreateModal,
        showEditModal,
        setShowEditModal,
        chosenId,
        setChosenId,
        onDelete
      }}>
        <h1 class="mb-2 text-2xl font-medium">Products</h1>
        <Breadcrumbs linkList={[ { name: "Products" } ]}/>

        {/* Search bar */}
        <ToolBar setShowCreateModal={setShowCreateModal}/>

        {/* Table */}
        <Table/>

        <Pagination totalItems={totalItems}/>

        <CreateProductModal showModal={showCreateModal} setShowModal={setShowCreateModal}/>
        <EditProductModal showModal={showEditModal} setShowModal={setShowEditModal}/>
      </ModalContext.Provider>
    </main>
  );
}
