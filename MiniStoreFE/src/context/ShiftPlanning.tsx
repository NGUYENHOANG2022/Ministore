import {
  Accessor,
  Setter,
  createContext,
  useContext,
} from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import {
  DataTable,
  Rule,
} from "~/components/shift-planning/utils/types";
import { Shift, Staff, ShiftTemplate } from "~/types";

export interface ShiftCard extends Shift {
  rules: Rule[];
}
export type ScheduleTemplateModalState =
  | "list"
  | "copy"
  | "create"
  | "apply"
  | undefined;

type SPModalContext = {
  shiftModalData: Accessor<ShiftCard | undefined>;
  setShiftModalData: Setter<ShiftCard | undefined>;
  showShiftModal: Accessor<boolean>;
  setShowShiftModal: Setter<boolean>;
  staffModalData: Accessor<Staff | undefined>;
  setStaffModalData: Setter<Staff | undefined>;
  showStaffModal: Accessor<boolean>;
  setShowStaffModal: Setter<boolean>;
  newShiftModalData: Accessor<{ staff: Staff; date: string } | undefined>;
  setNewShiftModalData: Setter<{ staff: Staff; date: string } | undefined>;
  showNewShiftModal: Accessor<boolean>;
  setShowNewShiftModal: Setter<boolean>;
  // Shift Template
  shiftTemplateModalData: Accessor<ShiftTemplate | undefined>;
  setShiftTemplateModalData: Setter<ShiftTemplate | undefined>;
  showShiftTemplateModal: Accessor<boolean>;
  setShowShiftTemplateModal: Setter<boolean>;
  // Schedule Template
  scheduleTemplateModalState: Accessor<ScheduleTemplateModalState>;
  setScheduleTemplateModalState: Setter<ScheduleTemplateModalState>;
  // Create Shift Cover
  showCreateCoverModal: Accessor<boolean>;
  setShowCreateCoverModal: Setter<boolean>;
};
type SPDataContext = {
  pickedDate: Accessor<string | undefined>;
  setPickedDate: Setter<string | undefined>;
  tableData: DataTable;
  setTableData: SetStoreFunction<DataTable>;
  isRouteDataLoading: () => boolean;
  resetTableData: () => void;
  saveChanges: () => void;
};

export const ModalContext = createContext<SPModalContext>();

export function useSPModals(): SPModalContext {
  return useContext(ModalContext)!;
}

export const PageDataContext = createContext<SPDataContext>();

export function useSPData(): SPDataContext {
  return useContext(PageDataContext)!;
}
