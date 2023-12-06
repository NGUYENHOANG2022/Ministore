import { useSPData, useSPModals } from "~/context/ShiftPlanning";
import moment from "moment";
import { getShiftRules } from "~/components/shift-planning/utils/shiftRules";
import ShiftCard from "~/components/shift-planning/ShiftCard";
import { shiftTimes } from "~/components/shift-planning/utils/shiftTimes";
import { Shift, ShiftCoverRequestStatus, Staff, TimesheetStatus } from "~/types";
import { batch, Component, onMount } from "solid-js";

const UninteractCard: Component<{
  shift: Shift;
  staff: Staff;
  date: string;
}> = ({ shift, staff, date }) => {
  const { setShiftModalData, setShowShiftModal } = useSPModals();
  const { isRouteDataLoading, tableData, setTableData } = useSPData();
  const attendance = () => shift?.timesheet?.status === TimesheetStatus.APPROVED
    ? "Attended"
    : moment(`${shift?.date} ${shift?.endTime}`).isBefore(moment())
      ? "Absent"
      : "Not yet"

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
      onClick={() => {
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

export default UninteractCard;