import { A, useLocation } from "solid-start";
import Breadcrumbs from "~/components/Breadcrumbs";
import routes from "~/utils/routes";
import axios from "axios";
import getEndPoint from "~/utils/getEndPoint";
import { useRouteData } from "@solidjs/router";
import { DataResponse, Order, PaymentStatus } from "~/types";
import { createServerData$ } from "solid-start/server";
import { Show } from "solid-js";
import { FaRegularCalendarCheck, FaRegularMoneyBill1, FaSolidCheck } from "solid-icons/fa";
import formatNumberWithCommas from "~/utils/formatNumberWithCommas";
import moment from "moment";

type PaymentResponse = {
  message: string;
  RspCode: string;
  order?: Order;
}

export function routeData() {
  const location = useLocation();

  return createServerData$(
    async ([ key, search ]) => {
      if (search === "") {
        throw new Error("Missing search params");
      }
      console.log(`${getEndPoint()}/${key}${search}`);
      const { data } = await axios.get<DataResponse<PaymentResponse>>(`${getEndPoint()}/${key}${search}`);

      console.log(data);
      if (data === undefined || data.content.order === undefined) {
        throw new Error("Order not found");
      }

      return data.content.order;
    },
    {
      key: () => [ "orders/payment/response", location.search ],
    }
  );
}

export default function OrdersResponse() {
  // TODO: Use createResource instead of createRouteData. We want to have a toast notification in the client side
  // something like createResource(() => !isServer, () => {});
  // remember to check how many times the resource fetcher is called. It should be called only once
  const data = useRouteData<typeof routeData>();

  return (
    <main>
      <h1 class="mb-2 text-2xl font-medium">Online Payment</h1>
      <Breadcrumbs
        linkList={[
          { name: "Orders", link: routes.orders },
          { name: "Response" },
        ]}
      />
      <Show when={data.error}>
        <div>
          Something went wrong.
        </div>
        <A
          href={routes.orderAdd}
          class="inline-block gap-1 justify-center items-center pl-3 pr-4 py-2 text-sm text-white bg-indigo-500 font-medium rounded-lg hover:bg-indigo-600">
          <span>Go back</span>
        </A>
      </Show>

      <Show when={!data.error && data() !== undefined && data()?.orderId !== undefined}>
        <div class="w-[600px] bg-white rounded-lg shadow-lg py-4 px-6 border border-gray-300 space-y-4">
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
                <p class="font-semibold">{formatNumberWithCommas(data()!.grandTotal)}&nbsp;₫</p>
              </div>
            </div>
          </div>
          <div class="flex justify-end">
            <A
              href={routes.invoice(data()!.orderId)}
              class="inline-block gap-1 justify-center items-center pl-3 pr-4 py-2 text-sm text-white bg-indigo-500 font-medium rounded-lg hover:bg-indigo-600">
              View Invoice
            </A>
          </div>
        </div>
      </Show>
    </main>
  );
}

