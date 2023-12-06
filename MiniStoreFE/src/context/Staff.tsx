import { Accessor, createContext, Setter, useContext, } from "solid-js";
import { Staff } from "~/types";

type StaffModalContext = {
  chosenId: Accessor<number>;
  setChosenId: Setter<number>;
  showDetailsModal: Accessor<boolean>;
  setShowDetailsModal: Setter<boolean>;
  onDelete: (staff: Staff) => Promise<void>;
  showCreateModal: Accessor<boolean>;
  setShowCreateModal: Setter<boolean>;
  showEditModal: Accessor<boolean>;
  setShowEditModal: Setter<boolean>;
};

export const ModalContext = createContext<StaffModalContext>();

export function useStaffContext(): StaffModalContext {
  return useContext(ModalContext)!;
}
