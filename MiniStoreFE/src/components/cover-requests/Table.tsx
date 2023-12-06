import { batch, For, Show } from "solid-js";
import { capitalize } from "~/utils/capitalize";
import { IoTrashOutline } from "solid-icons/io";
import { OcPencil3 } from "solid-icons/oc";
import routes from "~/utils/routes";
import { useRouteData } from "@solidjs/router";
import { routeData } from "src/routes/shift-cover-requests";
import { A } from "solid-start";
import { ShiftCoverRequestStatus } from "~/types";
import { useSCRContext } from "~/context/CoverRequest";
import { shiftTimes } from "~/components/shift-planning/utils/shiftTimes";

export default function Table() {
  const { data } = useRouteData<typeof routeData>();
  const { setChosenRequestId, setShowEditModal, onDelete } = useSCRContext();

  let onEdit = (id: number) => {
    batch(() => {
      setChosenRequestId(id);
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
            class="px-2.5 py-[8.7px] pl-[18px] w-56 text-left text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
          >
            Staff Member
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            Shift Name
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            Date
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            Time
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            Position
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            Status
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            Reassigned To
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-24 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            Actions
          </th>
        </tr>
        </thead>
        {/* <!-- Table row --> */}
        <tbody class="">
        <Show
          when={!data.error && data() !== undefined}
          fallback={<div class="w-full h-full min-h-[300px] grid place-items-center">Something went wrong</div>}>
          <For each={data()!.content}>
            {(item) => (
              <tr class="hover:bg-[#ceefff] odd:bg-white even:bg-gray-50 text-[#333c48]">
                <td
                  class="px-2.5 pl-[18px] text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  <A
                    href={routes.staff(item.staffId)}
                    class="hover:text-indigo-500"
                  >
                    {item.shift?.staff?.staffName ?? "N/A"}
                  </A>
                </td>
                <td
                  style={{
                    "border-left": "1px dashed #d5dce6",
                  }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.shift?.name ?? "N/A"}
                </td>
                <td
                  style={{
                    "border-left": "1px dashed #d5dce6",
                  }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.shift?.date ?? "N/A"}
                </td>
                <td
                  style={{
                    "border-left": "1px dashed #d5dce6",
                  }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {shiftTimes(item.shift?.startTime!, item.shift?.endTime!)}
                </td>
                <td
                  style={{
                    "border-left": "1px dashed #d5dce6",
                  }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.shift?.role ? capitalize(item.shift?.role): "N/A"}
                </td>
                <td
                  style={{
                    "border-left": "1px dashed #d5dce6",
                  }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                    <span
                      class="inline-block whitespace-nowrap px-2 py-0.5 text-xs text-center font-bold rounded-full"
                      classList={{
                        "text-orange-400 bg-orange-100": item.status === ShiftCoverRequestStatus.PENDING,
                        "text-green-400 bg-green-100": item.status === ShiftCoverRequestStatus.APPROVED,
                        "text-red-400 bg-red-100": item.status === ShiftCoverRequestStatus.REJECTED,
                      }}
                    >
                      {capitalize(item.status)}
                    </span>
                </td>
                <td
                  style={{
                    "border-left": "1px dashed #d5dce6",
                  }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.staff?.staffName ?? "N/A"}
                </td>
                <td
                  style={{
                    "border-left": "1px dashed #d5dce6",
                  }}
                  class="px-2.5 text-sm whitespace-nowrap leading-10 border-[#e2e7ee] border-b overflow-visible">
                  <div class="flex flex-row gap-1">
                    <div class="relative flex justify-center items-center">
                      <button
                        onClick={[ onEdit, item.shiftCoverRequestId ]}
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
                        onClick={[ onDelete, item.shiftCoverRequestId ]}
                        class="peer text-base text-gray-500 hover:text-indigo-500">
                        <IoTrashOutline/>
                      </button>
                      <span
                        class="peer-hover:visible peer-hover:opacity-100 invisible opacity-0 absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap z-10 transition-opacity duration-200 ease-in-out">
                          Delete
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