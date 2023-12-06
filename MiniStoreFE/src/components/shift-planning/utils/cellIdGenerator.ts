import { Staff } from "~/types";

export const cellIdGenerator = (staff: Staff, date: string) =>
  `${staff.staffId}-${staff.username}-${date}`;
