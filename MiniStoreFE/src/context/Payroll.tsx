import { Accessor, createContext, Setter, useContext, } from "solid-js";

export type ModalData = {
  staffId: number;
  isApproved: boolean;
  regularHours: number;
  leaveHours: number;
  totalHours: number;
  grossPay: number;
} | undefined;

type PRModalContext = {
  chosenId: Accessor<number>;
  setChosenId: Setter<number>;
  showModal: Accessor<boolean>;
  setShowModal: Setter<boolean>;
  modalData: Accessor<ModalData>;
  setModalData: Setter<ModalData>;
};

export const ModalContext = createContext<PRModalContext>();

export function usePRContext(): PRModalContext {
  return useContext(ModalContext)!;
}
