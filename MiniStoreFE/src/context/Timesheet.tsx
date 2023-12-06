import { Accessor, createContext, Setter, useContext, } from "solid-js";

type TSModalContext = {
  chosenId: Accessor<number>;
  setChosenId: Setter<number>;
  showEditModal: Accessor<boolean>;
  setShowEditModal: Setter<boolean>;
  onDelete: (id: number) => Promise<void>;
};

export const ModalContext = createContext<TSModalContext>();

export function useTSContext(): TSModalContext {
  return useContext(ModalContext)!;
}
