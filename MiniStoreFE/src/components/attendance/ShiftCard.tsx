import { Component, splitProps } from "solid-js";
import { Role, Shift, TimesheetStatus } from "~/types";
import { shiftDetailsTime } from "~/components/shift-planning/utils/shiftTimes";
import { roles } from "~/utils/roles";
import { capitalize } from "~/utils/capitalize";
import moment from "moment";

const ShiftCard:Component<{
  shift: Shift;
  onClick: () => void;
}> = (props) => {
  const [local] = splitProps(props, [ "shift", "onClick" ]);

  const isAbsent = (shift: Shift) => moment(`${shift.date} ${shift.endTime}`).isBefore(moment());
  const isStarted = (shift: Shift) => moment(`${shift.date} ${shift.startTime}`).isSameOrBefore(moment());

  return(
    <button
      onClick={local.onClick}
      class="rounded p-2 relative text-left mb-1 block w-full max-w-[600px]"
      classList={{
        "bg-white hover:bg-[#edf2f7] text-black border border-gray-200": !local.shift.shiftCoverRequest,
        "bg-[#efedfc] hover:bg-[#e4e0fa] text-[#7256e8] border border-[#efedfc]": !!local.shift.shiftCoverRequest,
      }}
    >
      <i
        class="absolute top-1.5 left-1.5 bottom-1.5 w-1.5 rounded"
        classList={{
          "bg-blue-500": local.shift.role === Role.CASHIER,
          "bg-yellow-500": local.shift.role === Role.GUARD,
          "bg-red-500": local.shift.role === Role.MANAGER,
          "bg-gray-600": local.shift.role === Role.ADMIN,
          "bg-gray-400": local.shift.role === Role.ALL_ROLES,
        }}
      ></i>
      <p class="ml-3.5 font-semibold text-sm tracking-wider">
        {shiftDetailsTime(local.shift.date || "", local.shift.startTime || "", local.shift.endTime || "")}
      </p>
      <p class="ml-3.5 font-normal text-xs text-[13px] tracking-wider">
        {local.shift.name}{" "}•{" "}
        {roles.find((r) => r.value === local.shift.role)?.label}
      </p>
      <div
        class="absolute top-1 right-1 inline-flex text-xs p-1 justify-center items-center font-semibold ml-1 rounded"
        classList={{
          "text-red-500 bg-red-100": local.shift.timesheet?.status === TimesheetStatus.REJECTED || (!local.shift.timesheet && isAbsent(local.shift)),
          "text-orange-500 bg-orange-100": local.shift.timesheet?.status === TimesheetStatus.PENDING,
          "text-green-500 bg-green-100": local.shift.timesheet?.status === TimesheetStatus.APPROVED,
        }}
      >
        {local.shift.timesheet ? capitalize(local.shift.timesheet.status)
          : isAbsent(local.shift)
            ? "Absent"
            : isStarted(local.shift) ? "Not submitted" : "Not started"}
      </div>
    </button>
  )
}
export default ShiftCard;