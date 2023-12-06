import { useRouteData } from "@solidjs/router";
import { For, Show } from "solid-js";
import formatNumberWithCommas from "~/utils/formatNumberWithCommas";
import { IoEyeOutline, IoTrashOutline } from "solid-icons/io";
import { routeData } from "~/routes/orders";
import { useOrderContext } from "~/context/Order";
import moment from "moment";
import { PaymentStatus, Role } from "~/types";
import { capitalize } from "~/utils/capitalize";
import { A } from "solid-start";
import routes from "~/utils/routes";
import { useAuth } from "~/context/Auth";

export default function Table() {
  const { data } = useRouteData<typeof routeData>();
  const { onDelete } = useOrderContext();
  const { user } = useAuth();

  return (
    <div class="flex flex-col border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
      <table class="min-w-full table-fixed">
        <thead class="bg-[#f8fafc] text-left">
        <tr>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-16 pl-[18px] text-left text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
          >
            ID
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-64 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Products
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-44 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Date
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-32 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Grand Total
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-32 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{ "border-left": "1px dashed #d5dce6" }}
          >
            Status
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
        <tbody>
        <Show
          when={!data.error && !data.loading && data.state === "ready"}
          fallback={<div class="w-full h-full min-h-[300px] grid place-items-center">Something went wrong</div>}>
          <For each={data()?.content}>
            {(item) => (
              <tr class="hover:bg-[#ceefff] odd:bg-white even:bg-gray-50 text-[#333c48]">
                <td
                  class="px-2.5 pl-[18px] text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.orderId}
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {item.orderItems.map(i => i.product.name).join(", ")}
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {moment(item.orderDate).format("MMM Do YYYY, h:mm:ss a")}
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                  {formatNumberWithCommas(item.grandTotal)} ₫
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                    <span
                      class="inline-block whitespace-nowrap px-2 py-0.5 text-xs text-center font-bold rounded-full"
                      classList={{
                        "text-orange-400 bg-orange-100": item.paymentStatus === PaymentStatus.PENDING,
                        "text-green-400 bg-green-100": item.paymentStatus === PaymentStatus.SUCCESS,
                        "text-red-400 bg-red-100": item.paymentStatus === PaymentStatus.FAILED,
                      }}
                    >
                      {capitalize(item.paymentStatus)}
                    </span>
                </td>
                <td
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 text-sm whitespace-nowrap leading-10 border-[#e2e7ee] border-b overflow-visible">
                  <div class="flex flex-row gap-1">
                    <div class="relative flex justify-center items-center">
                      <A
                        href={routes.order(item.orderId)}
                        class="peer text-base text-gray-500 hover:text-indigo-500">
                        <IoEyeOutline/>
                      </A>
                      <p
                        class="peer-hover:visible peer-hover:opacity-100 invisible opacity-0 absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap z-10 transition-opacity duration-200 ease-in-out">
                        Details
                      </p>
                    </div>
                    <Show when={user()?.role === Role.ADMIN || user()?.role === Role.MANAGER}>
                      <div class="relative flex justify-center items-center">
                        <button
                          onClick={[ onDelete, item.orderId ]}
                          class="peer text-base text-gray-500 hover:text-indigo-500">
                          <IoTrashOutline/>
                        </button>
                        <p
                          class="peer-hover:visible peer-hover:opacity-100 invisible opacity-0 absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap z-10 transition-opacity duration-200 ease-in-out">
                          Delete
                        </p>
                      </div>
                    </Show>
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
