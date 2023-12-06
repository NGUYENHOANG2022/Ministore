import { batch, For, Show } from "solid-js";
import { OcCheckcirclefill } from "solid-icons/oc";
import { useRouteData } from "@solidjs/router";
import { routeData } from "~/routes/payroll";
import { ModalData, usePRContext } from "~/context/Payroll";
import { Holiday, TimesheetStatus } from "~/types";
import moment from "moment";
import formatNumberWithCommas from "~/utils/formatNumberWithCommas";

export default function Table() {
  const { data, holidays } = useRouteData<typeof routeData>();
  const { setChosenId, setShowModal, setModalData } = usePRContext();

  let onOpenDetails = (obj: ModalData) => {
    batch(() => {
      setChosenId(obj!.staffId);
      setShowModal(true);
      setModalData(obj);
    });
  };

  // Check if the shift is in a holiday or not
  const isHoliday = (shift: any): Holiday | undefined => {
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
            class="px-2.5 py-[8.7px] pl-[18px] w-56 text-left text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
          >
            Name
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] w-36 text-sm font-medium text-[#637286] tracking-wider text-center border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            All Approved
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] text-sm font-medium text-[#637286] tracking-wider text-center border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            Planned Hours
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] text-sm font-medium text-[#637286] tracking-wider text-center border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            Absent Hours
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] text-sm font-medium text-[#637286] tracking-wider text-center border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            Worked Hours
          </th>
          <th
            scope="col"
            class="px-2.5 py-[8.7px] text-sm font-medium text-[#637286] tracking-wider text-center border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
            style={{
              "border-left": "1px dashed #d5dce6",
            }}
          >
            Gross Pay
          </th>
        </tr>
        </thead>
        {/* <!-- Table row --> */}
        <tbody class="">
        <Show
          when={!data.error && !data.loading && data.state === "ready"
            && !holidays.error && !holidays.loading && holidays.state === "ready"}
          fallback={<div class="w-full h-full min-h-[300px] grid place-items-center">Something went wrong</div>}>
          <For each={data()}>
            {(staff) => {
              const isApproved = staff.shifts.findIndex((shift) => !!shift.timesheet && shift.timesheet.status !== TimesheetStatus.APPROVED) === -1;
              const regularHours = staff.shifts.reduce((acc, shift) => {
                return acc + moment(shift.endTime, "HH:mm:ss").diff(moment(shift.startTime, "HH:mm:ss"), "hours", true);
              }, 0);
              // Leave hours are the hours that the staff is absent but still get paid
              const leaveHours = staff.shifts.reduce((acc, shift) => {
                const isAbsent = moment(`${shift.date} ${shift.endTime}`).isBefore(moment());
                const isStarted = moment(`${shift.date} ${shift.startTime}`).isSameOrBefore(moment());
                if (
                  isStarted && isAbsent &&
                  (
                    !shift.timesheet
                    || shift.timesheet.status !== TimesheetStatus.APPROVED
                    || staff.leaveRequests.some((leave) => moment(shift.date, "YYYY-MM-DD")
                      .isBetween(leave.startDate, leave.endDate, undefined, "[]"))
                  )
                )
                  return acc + moment(shift.endTime, "HH:mm:ss").diff(moment(shift.startTime, "HH:mm:ss"), "hours", true);

                return acc;
              }, 0);

              const workedHours = staff.shifts.reduce((acc, shift) => {
                const shiftHours = moment(shift.endTime, "HH:mm:ss").diff(moment(shift.startTime, "HH:mm:ss"), "hours", true);

                if (shift.timesheet && shift.timesheet.status === TimesheetStatus.APPROVED) {
                  return acc + shiftHours;
                }

                return acc;
              }, 0);

              const grossPay = staff.shifts.reduce((acc, shift) => {
                const shiftHours = moment(shift.endTime, "HH:mm:ss").diff(moment(shift.startTime, "HH:mm:ss"), "hours", true);
                const holiday = isHoliday(shift);
                const coefficient = holiday ? holiday.coefficient : shift.salaryCoefficient;

                if (shift.timesheet && shift.timesheet.status === TimesheetStatus.APPROVED) {
                  return acc + coefficient * (Number.parseFloat(shift.timesheet?.salary?.hourlyWage || "0")) * shiftHours;
                }

                return acc;
              }, 0);

              return (
                <tr
                  class="hover:bg-[#ceefff] odd:bg-white even:bg-gray-50 text-[#333c48] cursor-pointer"
                  onClick={[ onOpenDetails, {
                    staffId: staff.staffId,
                    isApproved,
                    regularHours,
                    leaveHours,
                    totalHours: workedHours,
                    grossPay
                  } ]}>
                  <td
                    class="px-2.5 pl-[18px] text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-b">
                    {staff.staffName}
                  </td>
                  <td
                    style={{ "border-left": "1px dashed #d5dce6" }}
                    class="px-2.5 text-sm whitespace-nowrap truncate text-center leading-10 border-[#e2e7ee] border-b">
                    <span
                      class="inline-block whitespace-nowrap px-2 py-0.5 text-xs text-center font-bold rounded-full"
                      classList={{
                        "text-orange-400": !isApproved,
                        "text-green-400": isApproved,
                      }}
                    >
                     <OcCheckcirclefill/>
                    </span>
                  </td>
                  <td
                    style={{ "border-left": "1px dashed #d5dce6", }}
                    class="px-2.5 text-sm whitespace-nowrap truncate text-center leading-10 border-[#e2e7ee] border-b">
                    {regularHours} hrs
                  </td>
                  <td
                    style={{ "border-left": "1px dashed #d5dce6" }}
                    class="px-2.5 text-sm whitespace-nowrap truncate text-center leading-10 border-[#e2e7ee] border-b">
                    {leaveHours} hrs
                  </td>
                  <td
                    style={{ "border-left": "1px dashed #d5dce6" }}
                    class="px-2.5 text-sm whitespace-nowrap truncate text-center leading-10 border-[#e2e7ee] border-b">
                    {workedHours} hrs
                  </td>
                  <td
                    style={{ "border-left": "1px dashed #d5dce6" }}
                    class="px-2.5 text-sm whitespace-nowrap truncate text-center leading-10 border-[#e2e7ee] border-b">
                    {formatNumberWithCommas(grossPay)} ₫
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
