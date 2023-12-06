import { Accessor, createContext, Setter, useContext, } from "solid-js";

type SCRModalContext = {
  chosenRequestId: Accessor<number>;
  setChosenRequestId: Setter<number>;
  showEditModal: Accessor<boolean>;
  setShowEditModal: Setter<boolean>;
  onDelete: (id: number) => Promise<void>;
};

export const ModalContext = createContext<SCRModalContext>();

export function useSCRContext(): SCRModalContext {
  return useContext(ModalContext)!;
}
