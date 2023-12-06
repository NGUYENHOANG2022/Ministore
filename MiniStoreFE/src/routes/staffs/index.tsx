import Breadcrumbs from "~/components/Breadcrumbs";
import { createRouteAction, createRouteData, useRouteData, useSearchParams, } from "solid-start";
import Pagination from "~/components/Pagination";
import { createSignal, Show } from "solid-js";
import { DataResponse, PageResponse, Staff, StaffStatus } from "~/types";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { ParamType } from "~/components/staffs/types";
import ToolBar from "~/components/staffs/ToolBar";
import { ModalContext } from "~/context/Staff";
import { toastSuccess } from "~/utils/toast";
import StaffDetailsModal from "~/components/staffs/StaffDetailsModal";
import Table from "~/components/staffs/Table";
import CreateStaffModal from "~/components/staffs/CreateStaffModal";
import UpdateStaffModal from "~/components/staffs/UpdateStaffModal";
import axios from "axios";

const disableStaff = async (staff: Omit<Staff, "shifts" | "leaveRequests">) => {
  try {
    const { data } = await axios.put<DataResponse<Staff>>(
      `${getEndPoint()}/staffs/${staff.staffId}/edit`,
      {
        ...staff,
        status:
          staff.status === StaffStatus.DISABLED
            ? StaffStatus.ACTIVATED
            : StaffStatus.DISABLED,
      }
    );

    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

export function routeData() {
  const [ params ] = useSearchParams<ParamType>();
  const staffs = createRouteData(
    async ([ key, perPage, curPage, search ]) => {
      try {
        const uri = new URLSearchParams({ perPage, curPage, search });
        const { data } = await axios.get<DataResponse<PageResponse<Staff>>>(
          `${getEndPoint()}/${key}?${uri.toString()}`
        );
        return data.content;
      } catch (e) {
        throw new Error(handleFetchError(e));
      }
    },
    {
      key: () => [
        "staffs",
        params.perPage ?? "10",
        params.curPage ?? "1",
        params.search ?? "",
      ],
      reconcileOptions: { key: "content.staffId" },
    }
  );

  return { data: staffs };
}

export default function Staffs() {
  const { data } = useRouteData<typeof routeData>();
  const [ showDetailsModal, setShowDetailsModal ] = createSignal<boolean>(false);
  const [ showEditModal, setShowEditModal ] = createSignal<boolean>(false);
  const [ showCreateModal, setShowCreateModal ] = createSignal<boolean>(false);
  const [ chosenId, setChosenId ] = createSignal<number>(0);
  const [ disabling, disableAction ] = createRouteAction(disableStaff);

  const totalItems = () => (data.error ? 0 : data()?.totalElements ?? 0);

  const onDelete = async (staff: Staff) => {
    if (disabling.pending) return;
    if (
      !confirm(
        `Are you sure you want to ${
          staff.status === StaffStatus.ACTIVATED ? "disable" : "activate"
        } this staff member?`
      )
    )
      return;

    const success = await disableAction(staff);
    if (!success) return;

    if (showDetailsModal()) setShowDetailsModal(false);
    toastSuccess("Staff is disabled successfully");
  };

  return (
    <main class="min-w-fit">
      <ModalContext.Provider
        value={{
          chosenId,
          setChosenId,
          showDetailsModal,
          setShowDetailsModal,
          onDelete,
          showCreateModal,
          setShowCreateModal,
          showEditModal,
          setShowEditModal,
        }}
      >
        <h1 class="mb-2 text-2xl font-medium">Staff Management</h1>
        <Breadcrumbs linkList={[ { name: "Staff Management" } ]}/>

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

        <StaffDetailsModal/>

        <CreateStaffModal/>

        <UpdateStaffModal/>
      </ModalContext.Provider>
    </main>
  );
}
