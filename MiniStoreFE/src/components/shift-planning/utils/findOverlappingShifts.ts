import { sortBy, union, unionBy } from "lodash";
import moment from "moment";
import { Shift } from "~/types";

// Find overlapping shifts
// Returns an array of shiftTemplateIds of overlapping shifts
export function findOverlappingShifts(shifts: Shift[]) {
  const s = unionBy(shifts, "shiftId");
  const sortedShifts = sortBy(s, "startTime");
  const overlappingShifts: number[] = [];

  for (let i = 0; i < sortedShifts.length - 1; i++) {
    const currentShift = sortedShifts[i];
    const nextShift = sortedShifts[i + 1];

    const currentShiftStart = moment(
      currentShift.startTime,
      "h:mm:ss"
    );
    const currentShiftEnd = moment(
      currentShift.endTime,
      "h:mm:ss"
    );

    if (currentShiftEnd.isSameOrBefore(currentShiftStart)) {
      currentShiftEnd.add(1, "day");
    }

    const nextShiftStart = moment(nextShift.startTime, "h:mm:ss");

    if (
      nextShiftStart.isBetween(
        currentShiftStart,
        currentShiftEnd,
        undefined,
        "[)"
      )
    ) {
      overlappingShifts.push(
        currentShift.shiftId,
        nextShift.shiftId
      );
    }
  }

  return union(overlappingShifts);
}
