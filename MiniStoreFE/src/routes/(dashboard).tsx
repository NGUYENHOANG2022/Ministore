import {FaSolidCoins} from "solid-icons/fa";
import {BiRegularWorld} from "solid-icons/bi";
import {Line} from "solid-chartjs";
import {FiArrowDown, FiArrowUp} from "solid-icons/fi";
import {Chart, Colors, Legend, Title, Tooltip} from "chart.js";
import {createEffect, createSignal, For, onMount} from "solid-js";
import axios from "axios";
import {DataResponse, Order, OrderItem, PageResponse, PaymentStatus, Product, SellingProduct} from "~/types";
import getEndPoint from "~/utils/getEndPoint";
import {useRouteData} from "@solidjs/router";
import {createRouteData, useSearchParams} from "solid-start";

export function routeData() {

  const sellingProducts = createRouteData(
      async () => {
        try {
          const {data} = await axios.get<DataResponse<SellingProduct[]>>(
              `${getEndPoint()}/order-items/selling-product`
          );
          return data.content;
        }
        catch (error) {
          console.error(error);
        }
      }
  );

  return {data : sellingProducts};
}

export default function Page() {

  // Total Revenue
  const [totalRevenue, setTotalRevenue] = createSignal<number>(0);
  createEffect(async () => {
    try {
      const response = await axios.get<DataResponse<Order[]>>(`${getEndPoint()}/orders/all`);

      const orders: Order[] = response.data.content;

      const currentDate = new Date();

      const currentMonthOrders = orders.filter(
          (order) =>
              new Date(order.orderDate).getMonth() === currentDate.getMonth() &&
              new Date(order.orderDate).getFullYear() === currentDate.getFullYear()
      );

      const successOrders = currentMonthOrders.filter(
          (order) => order.paymentStatus === PaymentStatus.SUCCESS
      );

      const total = successOrders.reduce(
          (acc, order) => acc + order.grandTotal,
          0
      );

      setTotalRevenue(total);
    }
    catch (error) {
      console.error(error);
    }
  });

  //Daily Sales
  const [dailySales, setDailySales] = createSignal<number>(0);

  const [labels, setLabels] = createSignal<string[]>([]);
  const [chartData, setChartData] = createSignal<number[]>([]);

  const [thisMonthSales, setThisMonthSales] = createSignal<number>(0);
  const [lastMonthSales, setLastMonthSales] = createSignal<number>(0);
  const [percentageChange, setPercentageChange] = createSignal<number>(0);
  const [isUp, setIsUp] = createSignal<boolean>(true);

  // Function to update the chart data based on fetched orders
  const updateChartData = (orders: Order[]) => {
    // Generate the last 10 days from today in the "dd-MM" format
    const today = new Date();
    const lastTenDays = Array.from({ length: 10 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toLocaleDateString("vn", { day: "2-digit", month: "2-digit" });
    }).reverse();

    // Create a map with the date as the key and count as the value
    const orderCountsMap = orders.reduce((map, order) => {
      const orderDate = new Date(order.orderDate);
      const formattedDate = orderDate.toLocaleDateString("vn", { day: "2-digit", month: "2-digit" });
      map.set(formattedDate, (map.get(formattedDate) || 0) + 1);
      return map;
    }, new Map<string, number>());

    // Populate labels and data arrays with counts for the last 10 days
    const chartLabels = lastTenDays.map((date) => date);
    const chartData = lastTenDays.map((date) => orderCountsMap.get(date) || 0);

    setLabels(chartLabels);
    setChartData(chartData);
  };

  function getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  createEffect(async () => {
    try {
      const response = await axios.get<DataResponse<Order[]>>(`${getEndPoint()}/orders/all`);

      const orders: Order[] = response.data.content;

      const successOrders = orders.filter(
          (order) => order.paymentStatus === PaymentStatus.SUCCESS
      );

      const currentDate = getCurrentDate();

      const dailyOrders = successOrders.filter(
          (order) => order.orderDate.split("T")[0] === currentDate
      );

      const dailyOrderCountValue = dailyOrders.length;
      setDailySales(dailyOrderCountValue);

      const saleData = orders.filter(
          (order) => order.paymentStatus === PaymentStatus.SUCCESS &&
              new Date(order.orderDate) >= new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      );

      //Sales compare
      const today = new Date();
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const thisMonthOrders = successOrders.filter(
          (order) => new Date(order.orderDate) >= thisMonthStart && new Date(order.orderDate) <= thisMonthEnd
      );
      const thisMonthCountOfSales = thisMonthOrders.length;
      setThisMonthSales(thisMonthCountOfSales);

      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      const lastMonthOrders = successOrders.filter(
          (order) => new Date(order.orderDate) >= lastMonthStart && new Date(order.orderDate) <= lastMonthEnd
      );
      const lastMonthCountOfSales = lastMonthOrders.length;
      setLastMonthSales(lastMonthCountOfSales);

      const change = thisMonthCountOfSales - lastMonthCountOfSales;
      const percentage = (change / lastMonthCountOfSales) * 100;
      setPercentageChange(percentage);
      setIsUp(percentage >= 0);

      updateChartData(saleData);
    }
    catch (error) {
      console.error(error);
    }
  });

  //Stock on hand
  const [stockOnHand, setStockOnHand] = createSignal<number>(0);
  createEffect(async () => {
    try {
      const response = await axios.get<DataResponse<Product[]>>(`${getEndPoint()}/products/all`);

      const products: Product[] = response.data.content;

      const totalInventory = products.reduce(
          (acc, products) => acc + products.inventory, 0);

      setStockOnHand(totalInventory);
    }
    catch (error) {
      console.error(error);
    }
  });

  //Top-selling product
  const {data} = useRouteData<typeof routeData>();
  onMount(() => {
    Chart.register(Title, Tooltip, Legend, Colors)
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cubicInterpolationMode: 'monotone',
    elements: {
      point: {
        radius: 0
      },
      line: {
        borderJoinStyle: 'round',
        borderWidth: 2,
      }
    },
    hover: {
      mode: 'index',
      intersect: false
    },
    scales: {
      x: {
        grid: {
          drawOnChartArea: false
        }
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false
      },
    }
  };

  return (
    <main class="min-w-fit">

      {/*Card*/}
      <div class="w-full px-2 py-2 mx-auto">
        {/*Row Card*/}
        <div class="flex justify-center mx-3">
          {/*Card 1*/}
          <div class="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
            <div
              class="relative flex flex-col min-w-0 break-words bg-white shadow-soft-xl rounded-2xl bg-clip-border shadow-lg">
              <div class="flex-auto p-4">
                <div class="flex flex-row -mx-3">
                  <div class="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p class="mb-0 font-sans font-bold leading-normal text-lg">Total Revenue</p>
                      <h5 class="mb-0 mt-1 font-bold text-lg text-green-600">
                        {(totalRevenue()/1.10).toLocaleString()} ₫
                      </h5>
                    </div>
                  </div>
                  <div class="px-3 flex justify-end basis-1/3">
                    <div
                      class="flex w-12 h-12 justify-center items-center rounded-lg bg-gradient-to-tl from-purple-700 to-blue-400">
                        <span class="text-white">
                          <FaSolidCoins/>
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*Card 2*/}
          <div class="w-full max-w-full px-3 mb-6 sm:w-1/3 sm:flex-none xl:mb-0 xl:w-1/4">
            <div
              class="relative flex flex-col min-w-0 break-words bg-white shadow-soft-xl rounded-2xl bg-clip-border shadow-lg">
              <div class="flex-auto p-4">
                <div class="flex justify-between">
                  <div class="flex-none w-7/10 max-w-full px-3">
                    <div>
                      <p class="mb-0 font-sans font-bold leading-normal text-lg">Daily Sales</p>
                      <h5 class="mb-0 mt-1 font-bold text-lg text-indigo-400">
                        {dailySales().toLocaleString()} {dailySales() === 1 ? 'invoice' : 'invoices'}
                      </h5>
                    </div>
                  </div>
                  <div class="px-3 flex justify-end basis-1/2">
                    <div
                      class="flex w-12 h-12 justify-center items-center rounded-lg bg-gradient-to-tl from-purple-700 to-blue-400">
                        <span class="text-white">
                            <BiRegularWorld/>
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*Card 3*/}
          <div class="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
            <div
              class="relative flex flex-col min-w-0 break-words bg-white shadow-soft-xl rounded-2xl bg-clip-border shadow-lg">
              <div class="flex-auto p-4">
                <div class="flex flex-row -mx-3">
                  <div class="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p class="mb-0 font-sans font-bold leading-normal text-lg">Stock on hand</p>
                      <h5 class="mb-0 mt-1 font-bold text-xl text-red-400">
                        {stockOnHand().toLocaleString()}
                      </h5>
                    </div>
                  </div>
                  <div class="px-3 flex justify-end basis-1/3">
                    <div
                      class="flex w-12 h-12 justify-center items-center rounded-lg bg-gradient-to-tl from-purple-700 to-blue-400">
                        <span class="text-white">
                            <FaSolidCoins/>
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*Chart*/}
        <div class="flex flex-wrap mt-6 -mx-3">
          <div class="w-full max-w-full px-3 mt-0 lg:w-100 lg:flex-none">
            <div
              class="border-black/12.5 shadow-soft-xl relative z-20 flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border shadow-lg">
              <div class="border-black/12.5 rounded-t-2xl border-b-0 border-solid bg-white p-6 pb-0">
                <h2 class="text-lg font-bold mb-1">Sales overview</h2>
                <div class="flex gap-6">
                  {isUp() ? (
                      <p class="leading-normal text-sm flex">
                        <span class="text-lime-500 text-lg">
                          <FiArrowUp />
                        </span>
                        <span class="font-semibold mr-1">{percentageChange().toFixed(2)}% </span> Last month
                      </p>
                  ) : (
                      <p class="leading-normal text-sm flex">
                        <span class="text-red-500 text-lg">
                          <FiArrowDown />
                        </span>
                        <span class="font-semibold mr-1">{Math.abs(Number(percentageChange().toFixed(2)))}% </span> Last month
                      </p>
                  )}
                </div>
              </div>
              <div class="flex-auto p-4">
                <div>
                  <Line
                      data={{
                        labels: labels(),
                        datasets: [
                          {
                            label: "Sales",
                            data: chartData(),
                            backgroundColor: "#5C59E8",
                            borderColor: "#5C59E8",
                          },
                        ],
                      }}
                      options={chartOptions}
                      height={300}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*Top-selling product*/}
        <div class="flex flex-wrap mt-6 -mx-3">
          <div class="w-full px-3 mt-0 lg:w-100 lg:flex-none">
            <div class="border-black/12.5 shadow-soft-xl relative z-20 flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border shadow-lg">
              <div class="border-black/12.5 rounded-2xl border-b-0 border-solid bg-white p-6 pb-0">
                <h2 class="text-lg font-bold mb-1">Top 5 selling product</h2>

                <div class="flex flex-col mt-6 mb-6">
                  <div class="flex flex-col border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
                    <table class="min-w-full table-fixed">
                      <thead class="bg-[#f8fafc] text-left">
                      <tr>
                        <th
                            class="px-6 py-2 text-left text-sm font-bold text-[#637286] border-b"
                            scope="col">Product Name
                        </th>
                        <th
                            class="px-4 py-2 text-left text-sm font-bold text-[#637286] border-b"
                            style={{ "border-left": "1px dashed #d5dce6" }}
                            scope="col">Quantity
                        </th>
                        <th
                            class="px-4 py-2 text-right text-sm font-bold text-[#637286] border-b"
                            style={{ "border-left": "1px dashed #d5dce6" }}
                            scope="col">Price
                        </th>
                        <th
                            class="px-6 py-2 text-right text-sm font-bold text-[#637286] border-b"
                            style={{ "border-left": "1px dashed #d5dce6" }}
                            scope="col">Total Price
                        </th>
                      </tr>
                      </thead>

                      <tbody>
                      <For each={data()}>
                        {(product) => (
                            <tr class="hover:bg-[#ceefff] odd:bg-white even:bg-gray-50 text-[#333c48]">
                              <th class="px-6 py-2 font-semibold text-left text-gray-500">
                                {product.productName}
                              </th>
                              <th class="px-4 py-2 font-semibold text-left text-gray-500"
                                  style={{ "border-left": "1px dashed #d5dce6" }}>
                                {product.totalQuantity}
                              </th>
                              <th class="px-4 py-2 font-semibold text-right text-gray-500"
                                  style={{ "border-left": "1px dashed #d5dce6" }}>
                                {product.price.toLocaleString()}&nbsp;₫
                              </th>
                              <th class="px-6 py-2 font-semibold text-right text-gray-500"
                                  style={{ "border-left": "1px dashed #d5dce6" }}>
                                {(product.price * product.totalQuantity).toLocaleString()}&nbsp;₫
                              </th>
                            </tr>
                        )}
                      </For>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
