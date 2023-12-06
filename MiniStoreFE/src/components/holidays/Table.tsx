import { batch, For, Show } from "solid-js";
import { IoTrashOutline } from "solid-icons/io";
import { useRouteData } from "@solidjs/router";
import { routeData } from "~/routes/holidays";
import { useHContext } from "~/context/Holiday";
import { OcPencil3 } from "solid-icons/oc";

export default function Table() {
  const { data } = useRouteData<typeof routeData>();
  const { onDelete, setChosenId, setShowEditModal } = useHContext();

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
            class="px-2.5 py-[8.7px] pl-[18px] w-56 text-left text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
          >
            Holiday Name
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Start Date
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            End Date
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Coefficient
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
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
                  {item.name}
                </td>
                <td
                  style={{
                    "border-left": "1px dashed #d5dce6",
                  }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.startDate}
                </td>
                <td
                  style={{
                    "border-left": "1px dashed #d5dce6",
                  }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.endDate}
                </td>

                <td
                  style={{
                    "border-left": "1px dashed #d5dce6",
                  }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.coefficient}
                </td>
                <td
                  style={{
                    "border-left": "1px dashed #d5dce6",
                  }}
                  class="px-2.5 text-sm whitespace-nowrap leading-10 border-[#e2e7ee] border-b overflow-visible">
                  <div class="flex flex-row gap-1">
                    <div class="relative flex justify-center items-center">
                      <button
                        onClick={[ onEdit, item.holidayId ]}
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
                        onClick={[ onDelete, item.holidayId ]}
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