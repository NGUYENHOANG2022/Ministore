import { Accessor, createContext, Setter, useContext, } from "solid-js";

type LRModalContext = {
  chosenLeaveRequestId: Accessor<number>;
  setChosenLeaveRequestId: Setter<number>;
  showEditModal: Accessor<boolean>;
  setShowEditModal: Setter<boolean>;
  onDelete: (id: number) => Promise<void>;
};

export const ModalContext = createContext<LRModalContext>();

export function useLRContext(): LRModalContext {
  return useContext(ModalContext)!;
}
