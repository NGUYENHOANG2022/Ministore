import Breadcrumbs from "~/components/Breadcrumbs";
import routes from "~/utils/routes";
import { TbDownload, TbListDetails } from "solid-icons/tb";
import { BsPrinter } from "solid-icons/bs";
import { createMemo, For, Show } from "solid-js";
import axios from "axios";
import { DataResponse, Order, PaymentStatus } from "~/types";
import { useParams, useRouteData } from "@solidjs/router";
import getEndPoint from "~/utils/getEndPoint";
import { A, createRouteData } from "solid-start";
import handleFetchError from "~/utils/handleFetchError";
import formatNumberWithCommas from "~/utils/formatNumberWithCommas";
import moment from "moment";
import { IoReceiptOutline } from "solid-icons/io";
import { capitalize } from "~/utils/capitalize";

export function routeData() {
  const params = useParams<{ id: string }>();

  const products = createRouteData(
    async ([key, id]) => {
      try {
        const { data } = await axios.get<DataResponse<Order>>(
          `${getEndPoint()}/${key}/${id}`
        );
        if (data === undefined || data.content === undefined)
          throw new Error("Order not found");

        return data.content;
      } catch (e) {
        throw new Error(handleFetchError(e));
      }
    },
    {
      key: () => ["orders", params.id],
      reconcileOptions: { key: "orderId" },
    }
  );
  return { data: products };
}

export default function Invoice() {
  const { data } = useRouteData<typeof routeData>();
  let invoice: HTMLDivElement | undefined = undefined;

  const subTotal = createMemo(() =>
    !data.error && data() !== undefined
      ? data()!.orderItems.reduce(
          (total, item) => item.product.price * item.quantity + total,
          0
        )
      : 0
  );

  const handleDownloadInvoice = () => {
    if (invoice === undefined) return;

    const pdfData = invoice.innerHTML;
    const pdfName = `invoice-${data()!.orderId}.pdf`;
    const pdfOptions = {
      margin: 0,
      filename: pdfName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    // @ts-ignore
    html2pdf().set(pdfOptions).from(pdfData).save();
  };

  function handlePrintInvoice() {
    if (invoice === undefined) return;

    const pdfData = invoice.innerHTML;
    const pdfName = `invoice-${data()!.orderId}.pdf`;
    const pdfOptions = {
      margin: 0,
      filename: pdfName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // @ts-ignore
    html2pdf()
      .set(pdfOptions)
      .from(pdfData)
      .toPdf()
      .output("blob")
      .then((pdf: Blob) => {
        console.log(pdf);
        const pdfUrl = URL.createObjectURL(pdf);

        const printWindow = window.open(pdfUrl, "_blank");

        printWindow!.onload = function () {
          printWindow!.print();
          URL.revokeObjectURL(pdfUrl);
        };
      });
  }

  return (
    <main class="min-w-fit">
      <h1 class="mb-2 text-2xl font-medium">Invoice</h1>
      <Breadcrumbs
        linkList={[
          { name: "Orders", link: routes.orders },
          { name: "Invoice" },
        ]}
      />

      <Show when={!data.error && data() !== undefined}>
        <div class="flex flex-row gap-4">
          {/*Invoice section*/}
          <div ref={invoice} id="invoice">
            <div class="px-10 py-8 bg-white border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
              <div class="flex items-center justify-between mb-8">
                <div class="flex">
                  <img src="/Logo.png" alt="MiniStore Logo" class="mr-3" />
                  <h2 class="text-2xl font-bold">MiniStore</h2>
                </div>
                <div>
                  <h2 class="text-2xl font-bold">Invoice</h2>
                </div>
              </div>
              <div class="border-t border-gray-200"></div>
              <div class="flex items-center justify-between mt-10">
                <div class="space-y-1">
                  <p class="text-gray-500 font-semibold">Order ID</p>
                  <p class="text-gray-500 font-semibold">Date</p>
                  <p class="text-gray-500 font-semibold">Payment Status</p>
                </div>
                <div class="space-y-1">
                  <p class="font-semibold text-right">#{data()!.orderId}</p>
                  <p class="font-semibold text-right">
                    {moment(data()!.orderDate).format("MMM Do YYYY, h:mm:ss a")}
                  </p>
                  <p
                    classList={{
                      "text-orange-400":
                        data()!.paymentStatus === PaymentStatus.PENDING,
                      "text-green-400":
                        data()!.paymentStatus === PaymentStatus.SUCCESS,
                      "text-red-400":
                        data()!.paymentStatus === PaymentStatus.FAILED,
                    }}
                    class="font-bold text-right"
                  >
                    {capitalize(data()!.paymentStatus)}
                  </p>
                </div>
              </div>

              {/*Table*/}
              <div class="flex flex-col border border-gray-200 rounded overflow-x-auto shadow-sm mt-8">
                <table class="min-w-full table-fixed">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        class="px-2.5 py-[8.7px] pl-[18px] w-52 text-left text-base font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
                        scope="col"
                      >
                        Product
                      </th>
                      <th
                        class="px-2.5 py-[8.7px] w-32 text-left text-base font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
                        scope="col"
                      >
                        Qty
                      </th>
                      <th
                        class="px-2.5 py-[8.7px] w-32 text-base text-right font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
                        scope="col"
                      >
                        Price
                      </th>
                      <th
                        class="px-2.5 py-[8.7px] w-32 text-base text-right font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
                        scope="col"
                      >
                        Total
                      </th>
                    </tr>
                  </thead>

                  {/*Table row*/}
                  <tbody>
                    <For each={data()?.orderItems}>
                      {(item, index) => (
                        <tr>
                          <td class="px-2.5 pl-[18px] text-base whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b text-gray-500 font-medium">
                            {item.product.name}
                          </td>
                          <td class="px-2.5 text-base whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b text-gray-500 font-medium">
                            {item.quantity} pcs
                          </td>
                          <td class="px-2.5 text-base text-right whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b text-gray-500 font-medium">
                            {formatNumberWithCommas(item.product.price)}&nbsp;₫
                          </td>
                          <td class="px-2.5 text-base text-right whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b text-gray-500 font-medium">
                            {formatNumberWithCommas(
                              item.product.price * item.quantity
                            )}
                            &nbsp;₫
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>

                  {/*Total price*/}
                  <tfoot>
                    <tr>
                      <td
                        colspan="3"
                        class="text-right px-2.5 py-2 font-medium"
                      >
                        Subtotal
                      </td>
                      <td class="px-2.5 py-2 font-medium text-right">
                        {formatNumberWithCommas(subTotal())}&nbsp;₫
                      </td>
                    </tr>
                    <tr>
                      <td
                        colspan="3"
                        class="text-right px-2.5 py-2 font-medium"
                      >
                        VAT (10%)
                      </td>
                      <td class="px-2.5 py-2 font-medium text-right">
                        {formatNumberWithCommas(subTotal() * 0.1)}&nbsp;₫
                      </td>
                    </tr>
                    <tr>
                      <td
                        colspan="3"
                        class="text-right px-2.5 py-2 font-medium"
                      >
                        Grand Total
                      </td>
                      <td class="px-2.5 py-2 font-bold text-right">
                        {formatNumberWithCommas(subTotal() + subTotal() * 0.1)}
                        &nbsp;₫
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/*Footer*/}
              <div class="flex justify-center mt-8">
                <p class="text-gray-500">
                  Should you have inquiries concerning this invoice, please
                  contact <span class="font-bold">Martha</span> on +1 (469) 227
                  9044
                </p>
              </div>
            </div>
          </div>

          {/*Invoice button*/}
          <div class="w-72">
            <div class="flex flex-col p-6 bg-white border border-gray-200 rounded-lg overflow-x-auto shadow-sm space-y-4">
              <button
                onClick={handlePrintInvoice}
                class="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-2 px-4 rounded-lg"
              >
                <p class="inline-flex items-center gap-2">
                  <BsPrinter />
                  Print Invoice
                </p>
              </button>
              <button
                onClick={handleDownloadInvoice}
                class="bg-[#dedefa] hover:bg-[#d6d6ff] active:bg-[#c5c5fc] text-indigo-500 font-bold py-2 px-4 rounded-lg"
              >
                <p class="inline-flex items-center gap-2">
                  <TbDownload />
                  Download Invoice
                </p>
              </button>
              <A
                href={routes.order(data()!.orderId)}
                class="block text-center bg-[#dedefa] hover:bg-[#d6d6ff] active:bg-[#c5c5fc] text-indigo-500 font-bold py-2 px-4 rounded-lg"
              >
                <p class="inline-flex items-center gap-2">
                  <TbListDetails />
                  View Order
                </p>
              </A>
              <A
                href={routes.orderAdd}
                class="block text-center bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-2 px-4 rounded-lg"
              >
                <p class="inline-flex items-center gap-2">
                  <IoReceiptOutline />
                  New Order
                </p>
              </A>
            </div>
          </div>
        </div>
      </Show>
    </main>
  );
}
