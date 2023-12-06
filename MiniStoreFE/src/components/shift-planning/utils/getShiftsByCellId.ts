import { Shift } from "~/types";
import { DataTable } from "./types";

function getShiftsByCellId(cellId: string, tableData: DataTable) {
  if (!tableData.cells.hasOwnProperty(cellId)) {
    return []; // Key does not exist in transformed data
  }

  const shiftIds = tableData.cells[cellId];

  const shifts: Shift[] = [];
  for (let shiftId of shiftIds) {
    const shift = tableData.shifts[shiftId];
    if (shift) {
      shifts.push(shift);
    }
  }

  return shifts;
}

export default getShiftsByCellId;
