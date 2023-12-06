import moment from "moment";
import { DataTable } from "~/components/shift-planning/utils/types";

export const checkOverlapWithLeaveRequest = (tableData: DataTable, staffId: number, date: string) => {
  return tableData.leaveRequests.some(
    (leaveRequest) =>
      leaveRequest.staffId === staffId &&
      moment(date, "YYYY-MM-DD").isBetween(leaveRequest.startDate, leaveRequest.endDate, undefined, "[]")
  )
}
