import { Accessor, createContext, Setter, useContext, } from "solid-js";
import { Staff } from "~/types";

type ProductContext = {
  chosenId: Accessor<number>;
  setChosenId: Setter<number>;
  onDelete: (id: number) => Promise<void>;
  showCreateModal: Accessor<boolean>;
  setShowCreateModal: Setter<boolean>;
  showEditModal: Accessor<boolean>;
  setShowEditModal: Setter<boolean>;
};

export const ModalContext = createContext<ProductContext>();

export function useProductContext(): ProductContext {
  return useContext(ModalContext)!;
}
