import { Draggable, Droppable } from "@thisbeyond/solid-dnd";
import { findOverlappingShifts } from "./findOverlappingShifts";
import { DataTable, Rule } from "./types";
import getShiftsByCellId from "./getShiftsByCellId";
import { Role, Shift, Staff } from "~/types";
import { cellIdGenerator } from "./cellIdGenerator";
import isDayInThePast from "../../../utils/isDayInThePast";
import { checkOverlapWithLeaveRequest } from "~/components/shift-planning/utils/checkOverlapWithLeaveRequest";

const rules: Rule[] = [
  {
    errorName: "Staff's role does not match",
    description:
      "Does this shift's required role matches with the staff's role?",
    passed: false,
  },
  {
    errorName: "Overlapping shifts",
    description: "Does this shift overlap with an existing shift?",
    passed: false,
  },
  {
    errorName: "Overlap with leave request",
    description: "Does this shift overlap with a leave request?",
    passed: false,
  },
];

export const getShiftRules = (
  shift: Shift,
  currentCell: {
    staff: Staff;
    date: string;
  },
  tableData: DataTable
) => {
  const result = rules.map((rule) => ({ ...rule }));

  // If the shift's required role is the same role as the staff
  if (
    shift.role === Role.ALL_ROLES ||
    shift.role === currentCell.staff.role
  )
    result[0].passed = true;

  // If the shift does not overlaps with another shift
  if (
    !findOverlappingShifts([
      ...getShiftsByCellId(
        cellIdGenerator(currentCell.staff, currentCell.date),
        tableData
      ),
      shift,
    ]).includes(shift.shiftId)
  )
    result[1].passed = true;

  // If the shift does not overlaps with a leave request
  if (!checkOverlapWithLeaveRequest(tableData, shift.staffId, currentCell.date))
    result[2].passed = true;

  return result;
};

export const getShiftMoveErrors = (
  draggable: Draggable,
  droppable: Droppable,
  tableData: DataTable
) => {
  const errors: Rule[] = [];

  // If the shift has been taken attendance
  if (tableData.shifts[draggable.id as number].timesheet)
    errors.push({
      errorName: "Cannot move a shift that has been taken attendance",
      description: "",
      passed: false,
    });

  // If the shift overlaps with a leave request
  if (checkOverlapWithLeaveRequest(tableData, droppable.data.staff.staffId, droppable.data.date))
    errors.push(rules[2]);

  // User can not modify a shift in the past
  if (isDayInThePast(tableData.shifts[draggable.id as number].date)) {
    errors.push({
      errorName: "Can not modify a shift in the past",
      description: "",
      passed: false,
    });
    return errors;
  }

  // User can not move a shift to the past
  if (isDayInThePast(droppable.data.date)) {
    errors.push({
      errorName: "Can not move a shift to the past",
      description: "",
      passed: false,
    });
    return errors;
  }

  // If the shift's required role is not the same role as the staff
  if (
    tableData.shifts[draggable.id as number].role !== Role.ALL_ROLES &&
    tableData.shifts[draggable.id as number].role !== droppable.data.staff.role
  )
    errors.push(rules[0]);

  // If the shift overlaps with another shift
  if (
    findOverlappingShifts([
      ...getShiftsByCellId(droppable.id as string, tableData),
      tableData.shifts[draggable.id as number],
    ]).includes(draggable.id as number)
  )
    errors.push(rules[1]);

  return errors;
};
