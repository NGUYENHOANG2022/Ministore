import { Holiday, LeaveRequest, Shift, Staff, StaffInfo } from "~/types";

export type ParamType = {
  picked_date: string;
};

export interface FetcherData {
  dates: string[];
  staffs: Staff[];
  holidays: Holiday[];
  staffsInfo?: StaffInfo[];
}

export type Rule = {
  errorName: string;
  description: string;
  passed: boolean;
};

export interface DataTable extends FetcherData {
  shifts: { [key: Shift["shiftId"]]: Shift };
  cells: { [key: string]: Shift["shiftId"][] };
  cellInfos: { [key: string]: { staffId: Staff["staffId"], date: string } };
  shiftsRules: { [key: Shift["shiftId"]]: Rule[] };
  leaveRequests: LeaveRequest[];
}
