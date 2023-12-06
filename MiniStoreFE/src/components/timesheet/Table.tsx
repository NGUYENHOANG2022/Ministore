import { batch, For, Show } from "solid-js";
import { IoTrashOutline } from "solid-icons/io";
import { OcPencil3 } from "solid-icons/oc";
import routes from "~/utils/routes";
import { useRouteData } from "@solidjs/router";
import { A } from "solid-start";
import { routeData } from "~/routes/timesheets";
import { useTSContext } from "~/context/Timesheet";
import { shiftTimes } from "~/components/shift-planning/utils/shiftTimes";
import formatNumberWithCommas from "~/utils/formatNumberWithCommas";
import moment from "moment";
import { capitalize } from "~/utils/capitalize";
import { Holiday, TimesheetStatus } from "~/types";

export default function Table() {
  const { data, holidays } = useRouteData<typeof routeData>();
  const { setChosenId, setShowEditModal, onDelete } = useTSContext();

  let onEdit = (id: number) => {
    batch(() => {
      setChosenId(id);
      setShowEditModal(true);
    });
  };

  const isHoliday = (shift: any): Holiday | undefined => {
    if (!shift) return undefined;

    return holidays()?.find((holiday) => moment(shift.date, "YYYY-MM-DD")
      .isBetween(holiday.startDate, holiday.endDate, undefined, "[]"));
  }

  return (
    <div class="flex flex-col border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
      <table class="min-w-full table-fixed">
        <thead class="bg-[#f8fafc] text-left">
        <tr>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] pl-[18px] w-44 text-left text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
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
            class="px-2.5 py-[8.7px] w-28 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            Coefficient
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            Hourly Wage
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            Total Hours
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            Total Wages
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
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
            Actions
          </th>
        </tr>
        </thead>
        {/* <!-- Table row --> */}
        <tbody class="">
        <Show
          when={!data.error && !data.loading && data.state === "ready"}
          fallback={<div class="w-full h-full min-h-[300px] grid place-items-center">Something went wrong</div>}>
          <For each={data()!.content}>
            {(timesheet) => {

              const holiday = isHoliday(timesheet.shift!);
              const coefficient = holiday ? holiday.coefficient : timesheet.shift!.salaryCoefficient;

              return (
                <tr class="hover:bg-[#ceefff] odd:bg-white even:bg-gray-50 text-[#333c48]">
                  <td
                    class="px-2.5 pl-[18px] text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                    <A
                      href={routes.staff(timesheet.staffId)}
                      class="hover:text-indigo-500"
                    >
                      {timesheet.staff?.staffName}
                    </A>
                  </td>
                  <td
                    style={{ "border-left": "1px dashed #d5dce6" }}
                    class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                    {timesheet.shift!.date}
                  </td>
                  <td
                    style={{ "border-left": "1px dashed #d5dce6" }}
                    class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                    {shiftTimes(timesheet.shift!.startTime, timesheet.shift!.endTime)}
                  </td>
                  <td
                    style={{ "border-left": "1px dashed #d5dce6" }}
                    class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                    {coefficient}
                  </td>
                  <td
                    style={{ "border-left": "1px dashed #d5dce6" }}
                    class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                    {formatNumberWithCommas(timesheet.salary?.hourlyWage || 0)} ₫
                  </td>
                  <td
                    style={{ "border-left": "1px dashed #d5dce6", }}
                    class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                    {moment(timesheet.shift?.endTime, "HH:mm:ss").diff(moment(timesheet.shift?.startTime, "HH:mm:ss"), "hours", true)} hrs
                  </td>
                  <td
                    style={{ "border-left": "1px dashed #d5dce6" }}
                    class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                    {formatNumberWithCommas((Number.parseFloat(timesheet.salary?.hourlyWage || "0")) * coefficient * moment(timesheet.shift?.endTime, "HH:mm:ss").diff(moment(timesheet.shift?.startTime, "HH:mm:ss"), "hours", true))} ₫
                  </td>
                  <td
                    style={{ "border-left": "1px dashed #d5dce6" }}
                    class="px-2.5 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                    <span
                      class="inline-block whitespace-nowrap px-2 py-0.5 text-xs text-center font-bold rounded-full"
                      classList={{
                        "text-orange-400 bg-orange-100": timesheet.status === TimesheetStatus.PENDING,
                        "text-green-400 bg-green-100": timesheet.status === TimesheetStatus.APPROVED,
                        "text-red-400 bg-red-100": timesheet.status === TimesheetStatus.REJECTED,
                      }}
                    >
                      {capitalize(timesheet.status)}
                    </span>
                  </td>
                  <td
                    style={{ "border-left": "1px dashed #d5dce6" }}
                    class="px-2.5 text-sm whitespace-nowrap leading-10 border-[#e2e7ee] border-b overflow-visible">
                    <div class="flex flex-row gap-1">
                      <div class="relative flex justify-center items-center">
                        <button
                          onClick={[ onEdit, timesheet.timesheetId ]}
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
                          onClick={[ onDelete, timesheet.timesheetId ]}
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
              )
            }}
          </For>
        </Show>
        </tbody>
      </table>
    </div>
  )
}
