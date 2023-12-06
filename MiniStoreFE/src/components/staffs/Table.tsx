import { batch, For, Show } from "solid-js";
import { IoEyeOutline } from "solid-icons/io";
import { useRouteData } from "@solidjs/router";
import formatNumberWithCommas from "~/utils/formatNumberWithCommas";
import { Role, StaffStatus } from "~/types";
import { routeData } from "~/routes/staffs";
import { useStaffContext } from "~/context/Staff";
import { FiLock, FiUnlock } from "solid-icons/fi";
import { capitalize } from "~/utils/capitalize";
import { OcPencil3 } from "solid-icons/oc";

export default function Table() {
  const { data } = useRouteData<typeof routeData>();
  const { setChosenId, setShowDetailsModal, setShowEditModal, onDelete } = useStaffContext();

  let onViewDetails = (id: number) => {
    batch(() => {
      setChosenId(id);
      setShowDetailsModal(true);
    });
  };

  let onEdit = (id: number) => {
    batch(() => {
      setChosenId(id);
      setShowEditModal(true);
    });
  };

  return (
    <div class="flex flex-col border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
      <table class="min-w-full table-fixed">
        <thead class="bg-[#f8fafc] text-left">
        <tr>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] pl-[18px] w-44 text-left text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
          >
            Name
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Username
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Phone Number
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-28 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Role
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Hourly Wage
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Work Days
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Status
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Actions
          </th>
        </tr>
        </thead>
        {/* <!-- Table row --> */}
        <tbody>
        <Show
          when={!data.error && !data.loading && data.state === "ready"}
          fallback={<div class="w-full h-full min-h-[300px] grid place-items-center">Something went wrong</div>}>
          <For each={data()!.content}>
            {(item) => (
              <tr class="hover:bg-[#ceefff] odd:bg-white even:bg-gray-50 text-[#333c48]">
                <td
                  class="px-2.5 pl-[18px] text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.staffName}
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.username}
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.phoneNumber}
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  <span
                    class="inline-block whitespace-nowrap px-2 py-0.5 text-xs text-center font-semibold rounded-full"
                    classList={{
                      "bg-blue-200 text-blue-700": item.role === Role.CASHIER,
                      "bg-yellow-200 text-yellow-700": item.role === Role.GUARD,
                      "bg-red-200 text-red-700": item.role === Role.MANAGER,
                      "bg-gray-200 text-gray-700": item.role === Role.ADMIN,
                      "bg-gray-200 text-gray-800": item.role === Role.ALL_ROLES,
                    }}
                  >
                    {capitalize(item.role)}
                  </span>
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {formatNumberWithCommas(item.salary?.hourlyWage || 0)} ₫
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6", }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.workDays}
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b"
                >
                  <span
                    class="inline-block whitespace-nowrap px-2 py-0.5 text-xs text-center font-bold rounded-full"
                    classList={{
                      "text-green-400 bg-green-100": item.status === StaffStatus.ACTIVATED,
                      "text-red-400 bg-red-100": item.status === StaffStatus.DISABLED,
                    }}
                  >
                    {item.status === StaffStatus.ACTIVATED ? "Active" : "Disabled"}
                  </span>
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 text-sm whitespace-nowrap leading-10 border-[#e2e7ee] border-b overflow-visible">
                  <div class="flex flex-row gap-1">
                    <div class="relative flex justify-center items-center">
                      <button
                        onClick={[ onEdit, item.staffId ]}
                        class="peer text-base text-gray-500 hover:text-indigo-500">
                        <OcPencil3/>
                      </button>
                      <span
                        class="peer-hover:visible peer-hover:opacity-100 invisible opacity-0 absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap z-10 transition-opacity duration-200 ease-in-out">
                          Edit
                      </span>
                    </div>
                    <div class="relative flex justify-center items-center">
                      <button
                        class="peer text-base text-gray-500 hover:text-indigo-500"
                        onClick={[ onViewDetails, item.staffId ]}
                      >
                        <IoEyeOutline/>
                      </button>
                      <span
                        class="peer-hover:visible peer-hover:opacity-100 invisible opacity-0 absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap z-10 transition-opacity duration-200 ease-in-out">
                        Quick view
                      </span>
                    </div>
                    <div class="relative flex justify-center items-center">
                      <button class="peer text-base text-gray-500 hover:text-indigo-500" onClick={[ onDelete, item ]}>
                        <Show
                          when={item.status === StaffStatus.ACTIVATED}
                          fallback={<FiUnlock/>}
                        >
                          <FiLock/>
                        </Show>
                      </button>
                      <span
                        class="peer-hover:visible peer-hover:opacity-100 invisible opacity-0 absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap z-10 transition-opacity duration-200 ease-in-out">
                       {item.status === StaffStatus.ACTIVATED ? "Disable" : "Enable"}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </For>
        </Show>
        </tbody>
      </table>
    </div>
  )
}
