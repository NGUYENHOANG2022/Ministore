import { createRouteAction, createRouteData, parseCookie, useRouteData, useServerContext, } from "solid-start";
import { DataResponse, LeaveRequest, PageResponse, ShiftCoverRequest, StaffInfo, } from "~/types";
import { createSignal, Show } from "solid-js";
import Breadcrumbs from "~/components/Breadcrumbs";
import Pagination from "~/components/Pagination";
import ToolBar from "~/components/cover-requests/Toolbar";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { useSearchParams } from "@solidjs/router";
import { ParamType } from "~/components/cover-requests/types";
import Table from "~/components/cover-requests/Table";
import { ModalContext } from "~/context/CoverRequest";
import { toastSuccess } from "~/utils/toast";
import CreateModalFallback from "~/components/cover-requests/CreateModalFallback";
import EditCoverRequestModal from "~/components/cover-requests/EditCoverRequestModal";
import { isServer } from "solid-js/web";
import axios from "axios";

const deleteCoverRequest = async (id: number) => {
  try {
    const { data } = await axios.delete<DataResponse<LeaveRequest>>(
      `${getEndPoint()}/shift-cover-requests/delete/${id}`
    );
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

export function routeData() {
  const [ params ] = useSearchParams<ParamType>();
  const leaveRequests = createRouteData(
    async ([ key, perPage, curPage, search ]) => {
      try {
        const uri = new URLSearchParams({ perPage, curPage, search });

        const event = useServerContext();
        const cookie = () =>
          parseCookie(
            isServer
              ? event.request.headers.get("cookie") ?? ""
              : document.cookie
          );

        const { data } = await axios.get<DataResponse<PageResponse<ShiftCoverRequest>>>(
          `${getEndPoint()}/${key}?${uri.toString()}`,
          {
            headers: {
              Authorization: "Bearer " + cookie().token,
            },
          }
        );
        return data.content;
      } catch (e) {
        throw new Error(handleFetchError(e));
      }
    },
    {
      key: () => [
        "shift-cover-requests",
        params.perPage ?? "10",
        params.curPage ?? "1",
        params.search ?? "",
      ],
      reconcileOptions: { key: "content.shiftCoverRequestId" },
    }
  );

  const staffInfos = createRouteData(
    async ([ key ]) => {
      try {
        const { data } = await axios.get<DataResponse<StaffInfo[]>>(
          `${getEndPoint()}/${key}`
        );
        return data.content;
      } catch (e) {
        throw new Error(handleFetchError(e));
      }
    },
    {
      key: () => [ "staffs/meta-infos" ],
      reconcileOptions: { key: "staffId" },
    }
  );
  return { data: leaveRequests, staffInfos };
}

export default function ShiftCoverRequests() {
  const { data, staffInfos } = useRouteData<typeof routeData>();
  const [ showCreateModal, setShowCreateModal ] = createSignal(false);
  const [ showEditModal, setShowEditModal ] = createSignal(false);
  const [ chosenRequestId, setChosenRequestId ] = createSignal(0);
  const [ deleting, deleteAction ] = createRouteAction(deleteCoverRequest);

  const totalItems = () => (data.error ? 0 : data()?.totalElements ?? 0);

  const onDelete = async (id: number) => {
    if (deleting.pending) return;
    if (!confirm("Are you sure you want to delete this shift cover request?"))
      return;

    const success = await deleteAction(id);
    if (!success) return;

    if (showEditModal()) setShowEditModal(false);
    toastSuccess("Shift cover request deleted successfully");
  };

  return (
    <main>
      <ModalContext.Provider
        value={{
          chosenRequestId,
          setChosenRequestId,
          showEditModal,
          setShowEditModal,
          onDelete,
        }}
      >
        <h1 class="mb-2 text-2xl font-medium">Shift Cover Requests</h1>
        <Breadcrumbs linkList={[ { name: "Shift Cover Requests" } ]}/>

        {/* Search bar */}
        <ToolBar setShowCreateModal={setShowCreateModal}/>

        <Show when={data.loading || staffInfos.loading}>
          <div class="mb-2">Loading...</div>
        </Show>

        <Table/>

        <Pagination totalItems={totalItems}/>

        <CreateModalFallback
          showModal={showCreateModal}
          setShowModal={setShowCreateModal}
        />

        <EditCoverRequestModal
          showModal={showEditModal}
          setShowModal={setShowEditModal}
        />
      </ModalContext.Provider>
    </main>
  );
}
