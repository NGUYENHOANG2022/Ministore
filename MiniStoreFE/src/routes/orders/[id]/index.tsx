import Breadcrumbs from "~/components/Breadcrumbs";
import routes from "~/utils/routes";
import { FaRegularCalendarCheck, FaRegularMoneyBill1, FaRegularUser, FaSolidCheck } from "solid-icons/fa";
import { OcMail2 } from "solid-icons/oc";
import { CgSmartphone } from "solid-icons/cg";
import { DataResponse, Order, PaymentStatus } from "~/types";
import { createMemo, For, Show } from "solid-js";
import axios from "axios";
import getEndPoint from "~/utils/getEndPoint";
import { A, createRouteData, useParams } from "solid-start";
import handleFetchError from "~/utils/handleFetchError";
import { useRouteData } from "@solidjs/router";
import moment from "moment";
import formatNumberWithCommas from "~/utils/formatNumberWithCommas";

export function routeData() {
  const params = useParams<{ id: string }>();

  const products = createRouteData(
    async ([ key, id ]) => {
      try {
        const { data } = await axios.get<DataResponse<Order>>(
          `${getEndPoint()}/${key}/${id}`
        );
        return data.content;
      } catch (e) {
        throw new Error(handleFetchError(e));
      }
    },
    {
      key: () => [ "orders", params.id ],
      reconcileOptions: { key: "orderId" }
    }
  );
  return { data: products };
}

export default function OrderDetails() {
  const { data } = useRouteData<typeof routeData>();

  const subTotal = createMemo(
    () => !data.error && data() !== undefined
      ? data()!.orderItems.reduce((total, item) => item.product.price * item.quantity + total, 0)
      : 0
  )

  return (
    <main class="min-w-fit">
      <h1 class="mb-2 text-2xl font-medium">Order Details</h1>
      <Breadcrumbs linkList={[
        { name: "Orders", link: routes.orders },
        { name: "Order Details" }
      ]}/>

      <Show when={!data.error && data() !== undefined}>
        <div class="flex flex-row gap-5">
          {/*Order*/}
          <div class="flex-1 bg-white rounded-lg shadow-lg py-4 px-6 border border-gray-300 space-y-4">
            <h2 class="text-xl font-medium">Order #{data()!.orderId}</h2>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <div class="border border-gray-100 bg-gray-100 p-1 rounded-full">
                    <div class="border border-gray-200 bg-gray-200 p-1.5 rounded-full text-gray-500">
                      <p class="text-lg">
                        <FaRegularCalendarCheck/>
                      </p>
                    </div>
                  </div>
                  <p class="ml-2 text-gray-500 font-semibold">Added</p>
                </div>
                <div>
                  <p class="font-semibold">{moment(data()!.orderDate).format("MMM Do YYYY, h:mm:ss a")}</p>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <div class="border border-gray-100 bg-gray-100 p-1 rounded-full">
                    <div class="border border-gray-200 bg-gray-200 p-1.5 rounded-full text-gray-500">
                      <p class="text-lg">
                        <FaSolidCheck/>
                      </p>
                    </div>
                  </div>
                  <p class="ml-2 text-gray-500 font-semibold">Payment Status</p>
                </div>
                <div>
                  <p
                    class="inline-block whitespace-nowrap px-2 py-0.5 text-sm text-center font-bold rounded-full"
                    classList={{
                      "text-orange-400 bg-orange-100": data()!.paymentStatus === PaymentStatus.PENDING,
                      "text-green-400 bg-green-100": data()!.paymentStatus === PaymentStatus.SUCCESS,
                      "text-red-400 bg-red-100": data()!.paymentStatus === PaymentStatus.FAILED,
                    }}
                  >
                    {data()!.paymentStatus}
                  </p>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <div class="border border-gray-100 bg-gray-100 p-1 rounded-full">
                    <div class="border border-gray-200 bg-gray-200 p-1.5 rounded-full text-gray-500">
                      <p class="text-lg">
                        <FaRegularMoneyBill1/>
                      </p>
                    </div>
                  </div>
                  <p class="ml-2 text-gray-500 font-semibold">Grand Total</p>
                </div>
                <div>
                  <p class="font-semibold">{formatNumberWithCommas(subTotal() + subTotal() * 0.1)}&nbsp;₫</p>
                </div>
              </div>
            </div>
          </div>

          {/*Cashier*/}
          <div class="flex-1 bg-white rounded-lg shadow-lg py-4 px-6 border border-gray-300 space-y-4">
            <h2 class="text-xl font-medium mb-4">Cashier</h2>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <div class="border border-gray-100 bg-gray-100 p-1 rounded-full">
                    <div class="border border-gray-200 bg-gray-200 p-1.5 rounded-full text-gray-500">
                      <p class="text-lg">
                        <FaRegularUser/>
                      </p>
                    </div>
                  </div>
                  <p class="ml-2 text-gray-500 font-semibold">Cashier</p>
                </div>
                <div>
                  <p class="font-semibold">{data()!.staff!.staffName}</p>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <div class="border border-gray-100 bg-gray-100 p-1 rounded-full">
                    <div class="border border-gray-200 bg-gray-200 p-1.5 rounded-full text-gray-500">
                      <p class="text-lg">
                        <OcMail2/>
                      </p>
                    </div>
                  </div>
                  <p class="ml-2 text-gray-500 font-semibold">Email</p>
                </div>
                <div>
                  <p class="font-semibold">{data()!.staff!.email}</p>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <div class="border border-gray-100 bg-gray-100 p-1 rounded-full">
                    <div class="border border-gray-200 bg-gray-200 p-1.5 rounded-full text-gray-500">
                      <p class="text-xl">
                        <CgSmartphone/>
                      </p>
                    </div>
                  </div>
                  <p class="ml-2 text-gray-500 font-semibold">Phone</p>
                </div>
                <div>
                  <p class="font-semibold">{data()!.staff!.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*Order List*/}
        <div class="w-full bg-white rounded-lg shadow-lg mt-4 py-4 px-6 border border-gray-300 space-y-4">
          <div class="flex flex-row justify-start items-center gap-3">
            <div class="flex flex-row items-center">
              <h2 class="text-xl font-medium mr-2">Order List</h2>
              <div class="rounded-lg bg-green-100 pl-4 pr-4">
                <p class="text-green-700 font-semibold">
                  {data()?.orderItems.length} Products
                </p>
              </div>
            </div>
            <div class="flex flex-row items-center">
              <A
                href={routes.invoice(data()!.orderId)}
                class="flex gap-1 justify-center items-center pl-3 pr-4 py-2 text-sm text-white bg-indigo-500 font-medium rounded-lg hover:bg-indigo-600">
                Get Invoice
              </A>
            </div>
          </div>

          {/*Table*/}
          <div class="flex flex-col overflow-x-auto">
            <table class="min-w-full table-fixed">

              {/*Table head*/}
              <thead class="bg-[#f8fafc] text-left">
              <tr>
                <th
                  class="px-2.5 py-[8.7px] w-64 text-base font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
                  scope="col">Product
                </th>
                <th
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 py-[8.7px] w-44 text-base font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
                  scope="col">Barcode
                </th>
                <th
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 py-[8.7px] w-32 text-base font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
                  scope="col">Qty
                </th>
                <th
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 py-[8.7px] w-48 text-base text-right font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
                  scope="col">Price
                </th>
                <th
                  style={{ "border-left": "1px dashed #d5dce6" }}
                  class="px-2.5 py-[8.7px] w-48 text-base text-right font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
                  scope="col">Total
                </th>
              </tr>
              </thead>

              {/*Table row*/}
              <tbody>
              <For each={data()?.orderItems}>
                {(item) => (
                  <tr>
                    <td
                      class="px-2.5 text-base whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">{item.product.name}</td>
                    <td
                      style={{ "border-left": "1px dashed #d5dce6" }}
                      class="px-2.5 text-base whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">{item.product.barCode}</td>
                    <td
                      style={{ "border-left": "1px dashed #d5dce6" }}
                      class="px-2.5 text-base whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">{item.quantity} pcs
                    </td>
                    <td
                      style={{ "border-left": "1px dashed #d5dce6" }}
                      class="px-2.5 text-base text-right whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">{formatNumberWithCommas(item.product.price)}&nbsp;₫
                    </td>
                    <td
                      style={{ "border-left": "1px dashed #d5dce6" }}
                      class="px-2.5 text-base text-right whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">{formatNumberWithCommas(item.product.price * item.quantity)}&nbsp;₫
                    </td>
                  </tr>
                )}
              </For>
              </tbody>

              {/*Total price*/}
              <tfoot>
              <tr>
                <td colspan="4" class="text-right px-2.5 py-[8.7px] font-medium">Subtotal</td>
                <td class="px-2.5 py-[8.7px] text-right font-medium">{formatNumberWithCommas(subTotal())}&nbsp;₫</td>
              </tr>
              <tr>
                <td colspan="4" class="text-right px-2.5 py-[8.7px] font-medium">VAT (10%)</td>
                <td class="px-2.5 py-[8.7px] text-right font-medium">{formatNumberWithCommas(subTotal() * 0.1)}&nbsp;₫
                </td>
              </tr>
              <tr>
                <td colspan="4" class="text-right px-2.5 py-[8.7px] font-medium">Grand Total</td>
                <td
                  class="px-2.5 py-[8.7px] text-right font-bold">{formatNumberWithCommas(subTotal() + subTotal() * 0.1)}&nbsp;₫
                </td>
              </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Show>
    </main>
  )
}