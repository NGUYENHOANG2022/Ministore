import { Accessor, createContext, Setter, useContext, } from "solid-js";

type CategoryContext = {
  setShowEditModal: Setter<boolean>;
  chosenId: Accessor<number>;
  setChosenId: Setter<number>;
  onDelete: (id: number) => Promise<void>;
};

export const ModalContext = createContext<CategoryContext>();

export function useCategoryContext(): CategoryContext {
  return useContext(ModalContext)!;
}
