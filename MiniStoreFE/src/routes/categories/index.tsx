import { createSignal } from "solid-js";
import { createRouteAction, createRouteData, useRouteData, useSearchParams } from "solid-start";
import Breadcrumbs from "~/components/Breadcrumbs";
import Pagination from "~/components/Pagination";
import { Category, DataResponse, PageResponse } from "~/types";
import axios from "axios";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { ParamType } from "~/components/category/types";
import ToolBar from "~/components/category/ToolBar";
import { toastSuccess } from "~/utils/toast";
import CreateCategoryModal from "~/components/category/CreateCategoryModal";
import { ModalContext } from "~/context/Category";
import EditCategoryModal from "~/components/category/EditCategoryModal";
import Table from "~/components/category/Table";

const deleteCategory = async (id: number) => {
  try {
    const { data } = await axios.delete<DataResponse<Category>>(
      `${getEndPoint()}/categories/delete/${id}`
    );
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

export function routeData() {
  const [ searchParams ] = useSearchParams<ParamType>();

  const categories = createRouteData(
    async ([ key, perPage, curPage, search ]) => {
      try {
        const uri = new URLSearchParams({ perPage, curPage, search });

        const { data } = await axios.get<DataResponse<PageResponse<Category>>>(
          `${getEndPoint()}/${key}?${uri.toString()}`
        );
        return data.content;
      } catch (e) {
        throw new Error(handleFetchError(e));
      }
    },
    {
      key: () => [ "categories", searchParams.perPage ?? "10", searchParams.curPage ?? "1", searchParams.search ?? "" ],
      reconcileOptions: { key: "content.categoryId" }
    }
  );

  return { data: categories };
}

export default function Categories() {
  const { data } = useRouteData<typeof routeData>();
  const [ showCreateModal, setShowCreateModal ] = createSignal(false);
  const [ showEditModal, setShowEditModal ] = createSignal(false);
  const [ chosenId, setChosenId ] = createSignal(0);
  const [ deleting, deleteAction ] = createRouteAction(deleteCategory);

  const totalItems = () => (data.error ? 0 : data()?.totalElements ?? 0);

  const onDelete = async (id: number) => {
    if (deleting.pending) return;
    if (!confirm("Are you sure you want to delete this category?"))
      return;

    const success = await deleteAction(id);
    if (!success) return;

    if (showEditModal()) setShowEditModal(false);
    toastSuccess("Category was deleted successfully");
  };

  return (
    <main>
      <ModalContext.Provider
        value={{
          chosenId,
          setChosenId,
          onDelete,
          setShowEditModal
        }}>
        <h1 class="mb-2 text-2xl font-medium">Categories</h1>
        <Breadcrumbs linkList={[ { name: "Categories" } ]}/>

        <ToolBar setShowCreateModal={setShowCreateModal}/>

        <Table/>

        <Pagination totalItems={totalItems}/>

        <CreateCategoryModal showModal={showCreateModal} setShowModal={setShowCreateModal}/>
        <EditCategoryModal showModal={showEditModal} setShowModal={setShowEditModal}/>
      </ModalContext.Provider>
    </main>
  );
}