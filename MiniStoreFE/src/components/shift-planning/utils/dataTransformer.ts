import moment from "moment";
import { cellIdGenerator } from "./cellIdGenerator";
import { DataTable, FetcherData } from "./types";

export function transformData(
  data: FetcherData,
): DataTable {
  const transformedData: DataTable = {
    shifts: {},
    cells: {},
    cellInfos: {},
    dates: data.dates,
    staffs: data.staffs,
    holidays: data.holidays,
    shiftsRules: {},
    leaveRequests: [],
    staffsInfo: data.staffsInfo,
  };

  if (data.staffs.length === 0) return transformedData;

  for (let staff of data.staffs) {
    for (let shift of staff.shifts) {
      transformedData.shifts[shift.shiftId] = { ...shift };
    }

    for (let date of data.dates) {
      const cellId = cellIdGenerator(staff, date);
      transformedData.cellInfos[cellId] = { staffId: staff.staffId, date: date };

      const matchingShifts = staff.shifts.filter((s) =>
        moment(s.date).isSame(date, "day")
      );

      if (!transformedData.cells.hasOwnProperty(cellId)) {
        transformedData.cells[cellId] = [];
      }

      for (let shift of matchingShifts) {
        transformedData.cells[cellId].push(shift.shiftId);
      }
    }

    for (let leaveRequest of staff.leaveRequests) {
      transformedData.leaveRequests.push(leaveRequest)
    }
  }

  return transformedData;
}
