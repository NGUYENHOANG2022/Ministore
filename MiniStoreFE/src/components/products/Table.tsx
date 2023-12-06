import { useRouteData } from "@solidjs/router";
import { routeData } from "~/routes/products";
import { useProductContext } from "~/context/Product";
import { batch, For, Show } from "solid-js";
import formatNumberWithCommas from "~/utils/formatNumberWithCommas";
import { IoTrashOutline } from "solid-icons/io";
import { OcPencil3 } from "solid-icons/oc";
import { useAuth } from "~/context/Auth";
import { Role } from "~/types";

export default function Table() {
  const { data } = useRouteData<typeof routeData>();
  const { setChosenId, setShowEditModal, onDelete } = useProductContext();
  const { user } = useAuth();

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
            class="px-2.5 py-[8.7px] w-32 pl-[18px] text-left text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
          >
            ID
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-44 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Barcode
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Name
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-40 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Category
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-40 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Inventory
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-48 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Price
          </th>
          <Show when={user()?.role === Role.ADMIN || user()?.role === Role.MANAGER}>
            <th
              scope="col"
              class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
              style={{ "border-left": "1px dashed #d5dce6" }}
            >
              Actions
            </th>
          </Show>
        </tr>
        </thead>
        {/* <!-- Table row --> */}
        <tbody>
        <Show
          when={!data.error && !data.loading && data.state === "ready"}
          fallback={<div class="w-full h-full min-h-[300px] grid place-items-center">Something went wrong</div>}>
          <For each={data()?.content}>
            {(item) => (
              <tr class="hover:bg-[#ceefff] odd:bg-white even:bg-gray-50 text-[#333c48]">
                <td
                  class="px-2.5 pl-[18px] text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.productId}
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.barCode}
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.name}
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.category?.name || ""}
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6", }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.inventory}
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b"
                >
                  {formatNumberWithCommas(item.price || 0)} ₫
                </td>
                <Show when={user()?.role === Role.ADMIN || user()?.role === Role.MANAGER}>
                  <td
                    style={{ "border-left": "1px dashed #d5dce6" }}
                    class="px-2.5 text-sm whitespace-nowrap leading-10 border-[#e2e7ee] border-b overflow-visible">
                    <div class="flex flex-row gap-1">
                      <div class="relative flex justify-center items-center">
                        <button
                          onClick={[ onEdit, item.productId ]}
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
                          onClick={[ onDelete, item.productId ]}
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
                </Show>
              </tr>
            )}
          </For>
        </Show>
        </tbody>
      </table>
    </div>
  )
}
