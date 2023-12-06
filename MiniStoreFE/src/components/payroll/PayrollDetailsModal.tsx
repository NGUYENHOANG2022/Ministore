import { Component, createMemo, For, Show } from "solid-js";
import PopupModal from "../PopupModal";
import { usePRContext } from "~/context/Payroll";
import { useRouteData, useSearchParams } from "@solidjs/router";
import { routeData } from "~/routes/payroll";
import { FaSolidAnglesRight } from "solid-icons/fa";
import { ParamType } from "~/components/payroll/types";
import moment from "moment";
import formatNumberWithCommas from "~/utils/formatNumberWithCommas";
import { OcCheckcirclefill } from "solid-icons/oc";
import { Holiday, TimesheetStatus } from "~/types";

const getDates = (fromDate: string, toDate: string) => {
  const dates: string[] = [];
  const dif = moment(toDate).diff(fromDate, "days");

  for (let i = 0; i <= dif; i++) {
    const curDate = moment(fromDate).clone().add(i, "days");
    dates.push(curDate.format("YYYY-MM-DD"));
  }
  return dates;
};

const PayrollDetailsModal: Component = () => {
  const { data, holidays } = useRouteData<typeof routeData>();
  const [ params ] = useSearchParams<ParamType>();
  const { chosenId, setShowModal, showModal, modalData } = usePRContext();

  const staff =
    createMemo(
      () => !data.error && data() !== undefined
        ? data()?.find((sc) => sc.staffId === chosenId())
        : undefined
    )

  const dates = () => !data.error && data() !== undefined ? getDates(params.from || "", params.to || "") : []

  // Check if the shift is in a holiday or not
  const isHoliday = (shift: any): Holiday | undefined => {
    return holidays()?.find((holiday) => moment(shift.date, "YYYY-MM-DD")
      .isBetween(holiday.startDate, holiday.endDate, undefined, "[]"));
  }

  return (
    <PopupModal.Wrapper
      title={
        <div class="flex gap-2 items-center">
          Payroll Details
          <span class="text-xs pt-0.5 text-gray-400"><FaSolidAnglesRight/></span>
          {staff()?.staffName}
        </div>
      }
      close={() => setShowModal(false)} open={showModal}
      width="900px"
    >
      <PopupModal.Body>
        <div class="flex flex-col items-center gap-2">
          <div class="text-base font-semibold text-gray-700">
            {moment(params.from).format("MMM DD")} - {moment(params.to).format("MMM DD, YYYY")}
          </div>
          <p class="text-gray-400 text-sm tracking-wide">
            This table shows the breakdown of hours and pay for each day during this payroll period.
          </p>
          <div class="w-full">
            <div class="bg-[#f8fafc] flex flex-row">
              <div
                class="px-2.5 py-[8.7px] pl-2 w-36 text-left text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-t leading-6">
                Day
              </div>
              <div
                class="px-2.5 py-[8.7px] w-36 text-center text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-t leading-6"
                style={{ "border-left": "1px dashed #d5dce6" }}>
                All Approved
              </div>
              <div
                class="px-2.5 py-[8.7px] flex-1 text-center text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-t leading-6"
                style={{ "border-left": "1px dashed #d5dce6" }}>
                Planned Hours
              </div>
              <div
                class="px-2.5 py-[8.7px] flex-1 text-center text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-t leading-6"
                style={{ "border-left": "1px dashed #d5dce6" }}>
                Absent Hours
              </div>
              <div
                class="px-2.5 py-[8.7px] flex-1 text-center text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-t leading-6"
                style={{ "border-left": "1px dashed #d5dce6" }}>
                Worked Hours
              </div>
              <div
                class="px-2.5 py-[8.7px] flex-1 text-center text-sm font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-t leading-6"
                style={{ "border-left": "1px dashed #d5dce6" }}>
                Gross Pay
              </div>
            </div>
            {/* <!-- Table row --> */}
            <div>
              <Show
                when={!data.error && !data.loading && data.state === "ready"}
                fallback={<div class="w-full h-full min-h-[300px] grid place-items-center">Something went wrong</div>}>
                <For each={dates()}>
                  {(date) => {
                    const isApproved = staff()?.shifts
                      .findIndex((shift) => moment(shift.date).isSame(date) && (!!shift.timesheet && shift.timesheet.status !== TimesheetStatus.APPROVED)) === -1;

                    const regularHours = staff()?.shifts.reduce((acc, shift) => {
                      if (moment(shift.date).isSame(date))
                        return acc + moment(shift.endTime, "HH:mm:ss").diff(moment(shift.startTime, "HH:mm:ss"), "hours", true);
                      return acc;
                    }, 0) || 0;

                    const leaveHours = staff()?.shifts.reduce((acc, shift) => {
                      const isAbsent = moment(`${shift.date} ${shift.endTime}`).isBefore(moment());
                      const isStarted = moment(`${shift.date} ${shift.startTime}`).isSameOrBefore(moment());
                      if (
                        isStarted && isAbsent && moment(shift.date).isSame(date) &&
                        (
                          !shift.timesheet
                          || shift.timesheet.status !== TimesheetStatus.APPROVED
                          || staff()?.leaveRequests.some((leave) => moment(shift.date, "YYYY-MM-DD")
                            .isBetween(leave.startDate, leave.endDate, undefined, "[]"))
                        )
                      )
                        return acc + moment(shift.endTime, "HH:mm:ss").diff(moment(shift.startTime, "HH:mm:ss"), "hours", true);

                      return acc;
                    }, 0) || 0;

                    const workedHours = staff()?.shifts.reduce((acc, shift) => {
                      if (!moment(shift.date).isSame(date)) return acc;

                      const shiftHours = moment(shift.endTime, "HH:mm:ss").diff(moment(shift.startTime, "HH:mm:ss"), "hours", true);

                      if (shift.timesheet && shift.timesheet.status === TimesheetStatus.APPROVED) {
                        return acc + shiftHours;
                      }

                      return acc;
                    }, 0) || 0;

                    const grossPay = staff()?.shifts.reduce((acc, shift) => {
                      if (!moment(shift.date).isSame(date)) return acc;

                      const shiftHours = moment(shift.endTime, "HH:mm:ss").diff(moment(shift.startTime, "HH:mm:ss"), "hours", true);
                      const holiday = isHoliday(shift);
                      const coefficient = holiday ? holiday.coefficient : shift.salaryCoefficient;

                      if (shift.timesheet && shift.timesheet.status === TimesheetStatus.APPROVED) {
                        return acc + coefficient * (Number.parseFloat(shift.timesheet?.salary?.hourlyWage || "0")) * shiftHours;
                      }

                      return acc;
                    }, 0) || 0;

                    return (
                      <div class="flex flex-row bg-white text-[#333c48]">
                        <div
                          class="w-36 px-2.5 pl-2 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-t">
                          {moment(date).format("ddd, MMM DD")}
                        </div>
                        <div style={{ "border-left": "1px dashed #d5dce6" }}
                             class="w-36 px-2.5 text-sm whitespace-nowrap text-center truncate leading-10 border-[#e2e7ee] border-t">
                          <p
                            class="inline-block whitespace-nowrap px-2 py-0.5 text-xs text-center font-bold rounded-full"
                            classList={{ "text-orange-400": !isApproved, "text-green-400": isApproved }}>
                            <OcCheckcirclefill/>
                          </p>
                        </div>
                        <div style={{ "border-left": "1px dashed #d5dce6" }}
                             class="flex-1 px-2.5 text-sm whitespace-nowrap text-center truncate leading-10 border-[#e2e7ee] border-t">
                          {regularHours} hrs
                        </div>
                        <div style={{ "border-left": "1px dashed #d5dce6" }}
                             class="flex-1 px-2.5 text-sm whitespace-nowrap text-center truncate leading-10 border-[#e2e7ee] border-t">
                          {leaveHours} hrs
                        </div>
                        <div style={{ "border-left": "1px dashed #d5dce6" }}
                             class="flex-1 px-2.5 text-sm whitespace-nowrap text-center truncate leading-10 border-[#e2e7ee] border-t">
                          {workedHours} hrs
                        </div>
                        <div style={{ "border-left": "1px dashed #d5dce6" }}
                             class="flex-1 px-2.5 text-sm whitespace-nowrap text-center truncate leading-10 border-[#e2e7ee] border-t">
                          {formatNumberWithCommas(grossPay)} ₫
                        </div>
                      </div>
                    )
                  }}
                </For>
              </Show>
              <div class="flex flex-row bg-white text-[#333c48] font-semibold">
                <div
                  class="w-36 px-2.5 pl-2 text-sm whitespace-nowrap truncate leading-10 border-[#e2e7ee] border-t">
                  Totals
                </div>
                <div style={{ "border-left": "1px dashed #d5dce6" }}
                     class="w-36 px-2.5 text-sm whitespace-nowrap truncate text-center leading-10 border-[#e2e7ee] border-t">
                  <p class="inline-block whitespace-nowrap px-2 py-0.5 text-xs text-center font-bold rounded-full"
                     classList={{
                       "text-orange-400": !modalData()?.isApproved,
                       "text-green-400": modalData()?.isApproved
                     }}>
                    <OcCheckcirclefill/>
                  </p>
                </div>
                <div style={{ "border-left": "1px dashed #d5dce6" }}
                     class="flex-1 px-2.5 text-sm whitespace-nowrap truncate text-center leading-10 border-[#e2e7ee] border-t">
                  {modalData()?.regularHours || 0} hrs
                </div>
                <div style={{ "border-left": "1px dashed #d5dce6" }}
                     class="flex-1 px-2.5 text-sm whitespace-nowrap truncate text-center leading-10 border-[#e2e7ee] border-t">
                  {modalData()?.leaveHours || 0} hrs
                </div>
                <div style={{ "border-left": "1px dashed #d5dce6" }}
                     class="flex-1 px-2.5 text-sm whitespace-nowrap truncate text-center leading-10 border-[#e2e7ee] border-t">
                  {modalData()?.totalHours || 0} hrs
                </div>
                <div style={{ "border-left": "1px dashed #d5dce6" }}
                     class="flex-1 px-2.5 text-sm whitespace-nowrap truncate text-center leading-10 border-[#e2e7ee] border-t">
                  {formatNumberWithCommas(modalData()?.grossPay || 0)} ₫
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopupModal.Body>
    </PopupModal.Wrapper>
  )
}
export default PayrollDetailsModal;
