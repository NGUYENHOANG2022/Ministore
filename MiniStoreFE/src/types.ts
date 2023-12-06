interface Timestamp {
  createdAt?: string;
  updatedAt?: string;
}

export enum Role {
  ALL_ROLES = "ALL_ROLES",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  CASHIER = "CASHIER",
  GUARD = "GUARD",
}

export enum StaffStatus {
  ACTIVATED = "ACTIVE",
  DISABLED = "DISABLED",
}

export enum TimesheetStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ShiftCoverRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum LeaveRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum LeaveType {
  VACATION = "VACATION",
  SICK = "SICK",
  OTHER = "OTHER",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface Staff extends Timestamp {
  staffId: number;
  staffName: string;
  role: Role;
  username: string;
  password?: string;
  phoneNumber?: string;
  status: StaffStatus;
  image?: string;
  email?: string;
  workDays?: string;
  leaveBalance: number;

  // relationship
  salary?: Salary;
  shifts: Shift[];
  leaveRequests: LeaveRequest[];
}

export interface StaffInfo {
  staffId: number;
  staffName: string;
  role: Role;
  username: string;
  email?: string;
  status: StaffStatus;
}

export interface LeaveRequest {
  leaveRequestId: number;
  staffId: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveRequestStatus;
  adminReply: string;

  // relationship
  staff?: Staff;
}

export interface Salary {
  salaryId: number;
  staffId: number;
  hourlyWage: string;
  effectiveDate: string;
  terminationDate?: string;
}

export interface Shift extends Timestamp {
  shiftId: number;
  staffId: number;
  date: string;
  published: boolean;
  role: Role;
  salaryCoefficient: number;
  startTime: string;
  endTime: string;
  name: string;

  // relationship
  timesheet?: Timesheet;
  shiftCoverRequest?: ShiftCoverRequest;

  staff?: Staff;
}

export interface Timesheet {
  timesheetId: number;
  shiftId: number;
  staffId: number;
  salaryId: number;
  checkInTime: string;
  checkOutTime: string | null;
  status: TimesheetStatus;
  noteTitle?: string;
  noteContent?: string;

  // relationship
  shift?: Shift;
  staff?: Staff;
  salary?: Salary;
}

export interface Holiday {
  holidayId: number;
  name: string;
  startDate: string;
  endDate: string;
  coefficient: number;
}

export interface ShiftCoverRequest {
  shiftCoverRequestId: number;
  shiftId: number;
  staffId: number;
  note: string;
  status: ShiftCoverRequestStatus;

  // relationship
  staff?: Staff;
  shift?: Shift;
}

export interface ShiftTemplate extends Timestamp {
  shiftTemplateId: number;
  startTime: string;
  endTime: string;
  name: string;
  salaryCoefficient: number;
  role: Role;
}

export interface ScheduleTemplate {
  scheduleTemplateId: number;
  name: string;
  description: string;
  numOfShifts: number;
  scheduleShiftTemplates: ScheduleShiftTemplate[];
}

export interface ScheduleShiftTemplate {
  scheduleShiftTemplateId: number;
  scheduleTemplateId: number;
  staffId: number;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  salaryCoefficient: number;
  role: Role;
}

export interface Order extends Timestamp {
  orderId: number;
  orderDate: string;
  grandTotal: number;
  staffId: number;
  paymentStatus: PaymentStatus;

  // relationship
  orderItems: OrderItem[];
  staff?: Staff;
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  quantity: number;
  productId: number;

  // relationship
  product: Product;
  order?: Order;
}

export interface SellingProduct {
  productName: string;
  totalQuantity: number;
  price: number;
}


export interface Product {
  productId: number;
  barCode: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  categoryId?: number;

  // relationship
  category?: Category;
}

export interface Category {
  categoryId: number;
  name: string;
  description: string;
  numberOfProducts: number;

  // add on
  sales?: number;
  stock?: number;
}

export interface DataResponse<T> extends Response {
  content: T;
  errors: string[] | string;
  timestamp: string;
  status: number;
}

export interface PageResponse<T> extends Response {
  content: T[];
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  empty: boolean;
  first: boolean;
  numberOfElements: number;
}

export type UserAuth = Pick<Staff, "staffId" | "staffName" | "status" | "role" | "username">
