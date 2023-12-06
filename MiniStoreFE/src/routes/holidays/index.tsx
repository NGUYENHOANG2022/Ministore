import { createRouteAction, createRouteData, useRouteData } from "solid-start";
import { DataResponse, Holiday, PageResponse } from "~/types";
import { createSignal, Show } from "solid-js";
import Breadcrumbs from "~/components/Breadcrumbs";
import Pagination from "~/components/Pagination";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { useSearchParams } from "@solidjs/router";
import { toastSuccess } from "~/utils/toast";
import { ParamType } from "~/components/holidays/types";
import { ModalContext } from "~/context/Holiday";
import ToolBar from "~/components/holidays/Toolbar";
import Table from "~/components/holidays/Table";
import CreateHolidayModal from "~/components/holidays/CreateHolidayModal";
import EditHolidayModal from "~/components/holidays/EditHolidayModal";
import axios from "axios";

const deleteHoliday = async (id: number) => {
  try {
    const { data } = await axios.delete<DataResponse<Holiday>>(
      `${getEndPoint()}/holidays/delete/${id}`
    );
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

export function routeData() {
  const [ params ] = useSearchParams<ParamType>();
  const holidays = createRouteData(
    async ([ key, perPage, curPage, search ]) => {
      try {
        const uri = new URLSearchParams({ perPage, curPage, search });
        const { data } = await axios.get<DataResponse<PageResponse<Holiday>>>(
          `${getEndPoint()}/${key}?${uri.toString()}`
        );
        return data.content;
      } catch (e) {
        throw new Error(handleFetchError(e));
      }
    },
    {
      key: () => [
        "holidays/list",
        params.perPage ?? "10",
        params.curPage ?? "1",
        params.search ?? "",
      ],
      reconcileOptions: { key: "content.holidayId" },
    }
  );
  return { data: holidays };
}

export default function Holidays() {
  const { data } = useRouteData<typeof routeData>();
  const [ showCreateModal, setShowCreateModal ] = createSignal(false);
  const [ showEditModal, setShowEditModal ] = createSignal(false);
  const [ chosenId, setChosenId ] = createSignal(0);
  const [ deleting, deleteAction ] = createRouteAction(deleteHoliday);

  const totalItems = () => (data.error ? 0 : data()?.totalElements ?? 0);

  const onDelete = async (id: number) => {
    if (deleting.pending) return;
    if (!confirm("Are you sure you want to delete this holiday?")) return;

    const success = await deleteAction(id);
    if (!success) return;

    if (showEditModal()) setShowEditModal(false);
    toastSuccess("Holiday deleted successfully");
  };

  return (
    <main>
      <ModalContext.Provider
        value={{
          chosenId,
          setChosenId,
          showCreateModal,
          setShowCreateModal,
          showEditModal,
          setShowEditModal,
          onDelete,
        }}
      >
        <h1 class="mb-2 text-2xl font-medium">Holidays</h1>
        <Breadcrumbs linkList={[ { name: "Holidays" } ]}/>

        {/* Search bar */}
        <ToolBar/>

        <Show when={data.loading}>
          <div class="mb-2">Loading...</div>
        </Show>

        <Show
          when={!data.error && data() !== undefined}
          fallback={<div>Something went wrong</div>}
        >
          <Table/>
        </Show>

        <Pagination totalItems={totalItems}/>

        <CreateHolidayModal/>
        <EditHolidayModal/>
      </ModalContext.Provider>
    </main>
  );
}
