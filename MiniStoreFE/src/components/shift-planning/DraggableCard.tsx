import { createDraggable } from "@thisbeyond/solid-dnd";
import { batch, Component, onMount } from "solid-js";
import { useSPData, useSPModals } from "~/context/ShiftPlanning";
import { Shift, ShiftCoverRequestStatus, Staff, TimesheetStatus } from "~/types";
import { shiftTimes } from "./utils/shiftTimes";
import ShiftCard from "./ShiftCard";
import { getShiftRules } from "./utils/shiftRules";
import moment from "moment";

const DraggableCard: Component<{
  shift: Shift;
  width: () => number | undefined;
  staff: Staff;
  date: string;
}> = ({ shift, width, staff, date }) => {
  const { setShiftModalData, setShowShiftModal } = useSPModals();
  const { isRouteDataLoading, tableData, setTableData } = useSPData();
  const attendance = () => shift?.timesheet?.status === TimesheetStatus.APPROVED
    ? "Attended"
    : moment(`${shift?.date} ${shift?.endTime}`).isBefore(moment())
      ? "Absent"
      : "Not yet"

  const draggable = createDraggable(shift.shiftId, {
    width,
    item: { date, staffId: staff.staffId },
  });

  const rules = getShiftRules(shift, { staff, date }, tableData);

  onMount(() => {
    batch(() => {
      // Modify shift data when drag and drop is done
      setTableData("shifts", shift.shiftId, () => ({
        staffId: staff.staffId,
        date: date,
        staff: staff,
      }));
      setTableData("shiftsRules", shift.shiftId, () => rules);
    });
  });

  return (
    <ShiftCard
      draggable={draggable}
      onClick={() => {
        if (draggable.isActiveDraggable) return;

        batch(() => {
          setShiftModalData({
            ...shift,
            staffId: staff.staffId,
            staff,
            date,
            rules,
          });
          setShowShiftModal(true);
        });
      }}
      isActiveDraggable={draggable.isActiveDraggable}
      published={shift.published}
      coveredShift={!!shift.shiftCoverRequest && shift.shiftCoverRequest.status === ShiftCoverRequestStatus.APPROVED}
      loading={isRouteDataLoading}
      role={shift.role}
      shiftDuration={shiftTimes(
        shift.startTime,
        shift.endTime
      )}
      shiftName={shift.name}
      isErrored={rules.find((rule) => !rule.passed) !== undefined}
      attendance={attendance}
    />
  );
};

export default DraggableCard;
