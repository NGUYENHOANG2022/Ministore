import { createRouteAction, createRouteData, useRouteData, useServerContext, } from "solid-start";
import { DataResponse, LeaveRequest, PageResponse } from "~/types";
import { createSignal, Show } from "solid-js";
import Breadcrumbs from "~/components/Breadcrumbs";
import Pagination from "~/components/Pagination";
import ToolBar from "~/components/leave-requests/Toolbar";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { useSearchParams } from "@solidjs/router";
import { ParamType } from "~/components/leave-requests/types";
import Table from "~/components/leave-requests/Table";
import CreateLeaveRequestModal from "~/components/leave-requests/CreateLeaveRequestModal";
import EditLeaveRequestModal from "~/components/leave-requests/EditLeaveRequestModal";
import { ModalContext } from "~/context/LeaveRequest";
import { toastSuccess } from "~/utils/toast";
import axios from "axios";
import cookie from "~/utils/cookie";

const deleteLeaveRequest = async (id: number) => {
  try {
    const { data } = await axios.delete<DataResponse<LeaveRequest>>(
      `${getEndPoint()}/leave-requests/delete/${id}`
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
        const event = useServerContext();
        const uri = new URLSearchParams({ perPage, curPage, search });

        const { data } = await axios.get<DataResponse<PageResponse<LeaveRequest>>>(
          `${getEndPoint()}/${key}?${uri.toString()}`,
          {
            headers: {
              Authorization: "Bearer " + cookie(event).token,
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
        "leave-requests/list",
        params.perPage ?? "10",
        params.curPage ?? "1",
        params.search ?? "",
      ],
      reconcileOptions: { key: "content.leaveRequestId" },
    }
  );
  return { data: leaveRequests };
}

export default function LeaveRequests() {
  const { data } = useRouteData<typeof routeData>();
  const [ showCreateModal, setShowCreateModal ] = createSignal(false);
  const [ showEditModal, setShowEditModal ] = createSignal(false);
  const [ chosenLeaveRequestId, setChosenLeaveRequestId ] = createSignal(0);
  const [ deleting, deleteAction ] = createRouteAction(deleteLeaveRequest);

  const totalItems = () => (data.error ? 0 : data()?.totalElements ?? 0);

  const onDelete = async (id: number) => {
    if (deleting.pending) return;
    if (!confirm("Are you sure you want to delete this leave request?")) return;

    const success = await deleteAction(id);
    if (!success) return;

    if (showEditModal()) setShowEditModal(false);
    toastSuccess("Leave request deleted successfully");
  };

  return (
    <main>
      <ModalContext.Provider
        value={{
          chosenLeaveRequestId,
          setChosenLeaveRequestId,
          showEditModal,
          setShowEditModal,
          onDelete,
        }}
      >
        <h1 class="mb-2 text-2xl font-medium">Leave Requests</h1>
        <Breadcrumbs linkList={[ { name: "Leave Requests" } ]}/>

        {/* Search bar */}
        <ToolBar setShowCreateModal={setShowCreateModal}/>

        <Show when={data.loading}>
          <div class="mb-2">Loading...</div>
        </Show>

        <Table/>

        <Pagination totalItems={totalItems}/>

        <CreateLeaveRequestModal
          showModal={showCreateModal}
          setShowModal={setShowCreateModal}
        />

        <EditLeaveRequestModal
          showModal={showEditModal}
          setShowModal={setShowEditModal}
        />
      </ModalContext.Provider>
    </main>
  );
}
