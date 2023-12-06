import { Accessor, createContext, Setter, useContext, } from "solid-js";

type OrderContext = {
  setShowDetailsModal: Setter<boolean>;
  chosenId: Accessor<number>;
  setChosenId: Setter<number>;
  onDelete: (id: number) => Promise<void>;
};

export const ModalContext = createContext<OrderContext>();

export function useOrderContext(): OrderContext {
  return useContext(ModalContext)!;
}
