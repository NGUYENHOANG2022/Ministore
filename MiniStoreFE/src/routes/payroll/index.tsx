import { useSearchParams } from "@solidjs/router";
import { ParamType } from "~/components/payroll/types";
import { DataResponse, Holiday, Role, Staff } from "~/types";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { createRouteData, useRouteData } from "solid-start";
import { createSignal, Show } from "solid-js";
import { ModalContext } from "~/context/Payroll";
import Breadcrumbs from "~/components/Breadcrumbs";
import ToolBar from "~/components/payroll/Toolbar";
import Table from "~/components/payroll/Table";
import PayrollDetailsModal from "~/components/payroll/PayrollDetailsModal";
import axios from "axios";
import routes from "~/utils/routes";
import checkAuth from "~/utils/checkAuth";

export function routeData() {
  const [ params ] = useSearchParams<ParamType>();
  const timesheets = createRouteData(
    async ([ key, search, from, to ]) => {
      try {
        checkAuth([ Role.ADMIN, Role.MANAGER ], routes.dashboard);

        if (!from || !to) return;
        const uri = new URLSearchParams({ search, from, to });
        const { data } = await axios.get<DataResponse<Staff[]>>(
          `${getEndPoint()}/${key}?${uri.toString()}`
        );
        console.log(data.content);
        return data.content;
      } catch (e) {
        throw new Error(handleFetchError(e));
      }
    },
    {
      key: () => [
        "timesheets/payroll",
        params.search ?? "",
        params.from ?? "",
        params.to ?? "",
      ],
      reconcileOptions: { key: "staffId" },
    }
  );

  const holidays = createRouteData(
    async ([ key, from, to ]) => {
      try {

        if (!from || !to) return;
        const uri = new URLSearchParams({ from, to });
        const { data } = await axios.get<DataResponse<Holiday[]>>(
          `${getEndPoint()}/${key}?${uri.toString()}`
        );
        console.log(data.content);
        return data.content;
      } catch (e) {
        throw new Error(handleFetchError(e));
      }
    },
    {
      key: () => [ "holidays/all", params.from ?? "", params.to ?? "" ],
      reconcileOptions: { key: "holidayId" },
    }
  );
  return { data: timesheets, holidays };
}

export default function Payroll() {
  const { data, holidays } = useRouteData<typeof routeData>();
  const [ showModal, setShowModal ] = createSignal(false);
  const [ chosenId, setChosenId ] = createSignal(0);
  const [ modalData, setModalData ] = createSignal(undefined);

  return (
    <main>
      <ModalContext.Provider
        value={{
          chosenId,
          setChosenId,
          showModal,
          setShowModal,
          modalData,
          setModalData,
        }}
      >
        <h1 class="mb-2 text-2xl font-medium">Payroll</h1>
        <Breadcrumbs linkList={[ { name: "Payroll" } ]}/>

        {/* Search bar */}
        <ToolBar/>

        <Show when={data.loading || holidays.loading}>
          <div class="mb-2">Loading...</div>
        </Show>

        <Show
          when={
            !data.error &&
            data() !== undefined &&
            !holidays.error &&
            holidays() !== undefined
          }
          fallback={<div>Something went wrong</div>}
        >
          <Table/>
        </Show>

        <PayrollDetailsModal/>
      </ModalContext.Provider>
    </main>
  );
}
