import { useRouteData, useSearchParams } from "@solidjs/router";
import { createRouteAction, createRouteData } from "solid-start";
import Breadcrumbs from "~/components/Breadcrumbs";
import Pagination from "~/components/Pagination";
import { isServer } from "solid-js/web";
import moment from "moment";
import axios from "axios";
import { DataResponse, Order, PageResponse } from "~/types";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { ParamType } from "~/components/order/types";
import ToolBar from "~/components/order/ToolBar";
import Table from "~/components/order/Table";
import { ModalContext } from "~/context/Order";
import { toastSuccess } from "~/utils/toast";
import { createSignal } from "solid-js";

const deleteOrder = async (id: number) => {
  try {
    const { data } = await axios.delete<DataResponse<Order>>(
      `${getEndPoint()}/orders/delete/${id}`
    );
    if (!data) throw new Error("Invalid response from server");
    return true;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
};

export function routeData() {
  const [ params ] = useSearchParams<ParamType>();

  const orders = createRouteData(
    async ([ key, perPage, curPage, amount_from, amount_to, ago, from, to ]) => {
      try {
        const uri = new URLSearchParams();
        if (perPage) uri.append("perPage", perPage);
        if (curPage) uri.append("curPage", curPage);
        if (amount_from) uri.append("amount_from", amount_from);
        if (amount_to) uri.append("amount_to", amount_to);
        if (ago) uri.append("ago", ago);
        if (from) uri.append("from", moment(from).format("YYYY-MM-DD[T]HH:mm:ss"));
        if (to) uri.append("to", moment(to).format("YYYY-MM-DD[T]HH:mm:ss"));

        const { data } = await axios.get<DataResponse<PageResponse<Order>>>(
          `${getEndPoint()}/${key}?${uri.toString()}`
        );

        return data.content;
      } catch (e) {
        throw new Error(handleFetchError(e));
      }
    },
    {
      key: () => [
        "orders",
        params.perPage,
        params.curPage,
        params.amount_from,
        params.amount_to,
        params.ago,
        params.from,
        params.to
      ],
      reconcileOptions:{
        key: "content.orderId"
      }
    }
  );

  return { data: orders };
}

export default function Orders() {
  const [ searchParams, setSearchParams ] = useSearchParams<ParamType>();

  if (isServer && (searchParams.from || searchParams.to)) {
    const from = moment(searchParams.from);
    const to = moment(searchParams.to);

    // check for the 'from' and 'to' params to be valid dates
    if (!from.isValid() || !to.isValid()) {
      setSearchParams({ from: undefined, to: undefined });
    }

    // check for the 'from' param to always be less than the 'to' param
    if (from.isAfter(to)) {
      setSearchParams({
        from: to.format("YYYY-MM-DD"),
        to: from.format("YYYY-MM-DD"),
      });
    }
  }

  const { data } = useRouteData<typeof routeData>();
  const [ showDetailsModal, setShowDetailsModal ] = createSignal(false);
  const [ showEditModal, setShowEditModal ] = createSignal(false);
  const [ chosenId, setChosenId ] = createSignal(0);
  const [ deleting, deleteAction ] = createRouteAction(deleteOrder);
  const totalItems = () => (data.error ? 0 : data()?.totalElements ?? 0);

  const onDelete = async (id: number) => {
    if (deleting.pending) return;
    if (!confirm("Are you sure you want to delete this order?"))
      return;

    const success = await deleteAction(id);
    if (!success) return;

    if (showEditModal()) setShowEditModal(false);
    toastSuccess("Order was deleted successfully");
  };

  return (
    <main class="min-w-fit">
      <ModalContext.Provider value={{
        setShowDetailsModal,
        chosenId,
        setChosenId,
        onDelete
      }}>
        <h1 class="mb-2 text-2xl font-medium">Orders</h1>
        <Breadcrumbs linkList={[ { name: "Orders" } ]}/>

        <ToolBar/>

        <Table/>

        <Pagination totalItems={totalItems}/>
      </ModalContext.Provider>
    </main>
  );
}

