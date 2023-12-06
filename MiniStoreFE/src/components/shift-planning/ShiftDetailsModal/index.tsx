import { Accessor, batch, Component, createMemo, createSignal, Match, Setter, Show, Switch, } from "solid-js";
import PopupModal from "../../PopupModal";
import Details from "./Details";
import Edit from "./Edit";
import Errors from "./Errors";
import Copy from "./Copy";
import { ShiftCard, useSPData, useSPModals } from "~/context/ShiftPlanning";
import { toastConfirmDeletion, toastSuccess } from "~/utils/toast";
import { DataResponse, Role } from "~/types";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import toast from "solid-toast";
import { cellIdGenerator } from "~/components/shift-planning/utils/cellIdGenerator";
import { useAuth } from "~/context/Auth";
import axios from "axios";

export type Tabs = "details" | "edit" | "errors" | "copy";

const ShiftDetailsModal: Component<{
  showModal: Accessor<boolean>;
  modalData: Accessor<ShiftCard | undefined>;
  setShowModal: Setter<boolean>;
  setShiftModalData: Setter<ShiftCard>;
}> = ({ showModal, modalData, setShowModal, setShiftModalData }) => {
  const [ state, setState ] = createSignal<Tabs>("details");
  const { setTableData } = useSPData();
  const { setShowCreateCoverModal } = useSPModals();
  const { user } = useAuth();

  const onCloseModal = () => {
    setShowModal(false);
    setState("details");
  };

  const onDeleteShift = async () => {
    toastConfirmDeletion(
      <>
        <p class="text-sm font-medium text-red-600">
          Are you sure you want to delete this shift?
        </p>
        <p class="mt-1 text-sm text-gray-600 font-medium">
          This action cannot be undone.
        </p>
        <p class="mt-1 text-sm text-gray-600 font-medium">
          This will also delete any timesheets associated with this shift.
        </p>
      </>,
      async (t) => {
        try {
          if (!modalData() || !modalData()?.shiftId)
            throw new Error("Invalid shift id");

          const { data } = await axios.delete<DataResponse<null>>(
            `${getEndPoint()}/shifts/delete/${modalData()?.shiftId}`
          );
          console.log(data);
          if (!data) throw new Error("Invalid response from server");

          // Delete the table data.
          batch(() => {
            setShowModal(false);
            setTableData("shifts", modalData()!.shiftId, undefined!);
            setTableData("shiftsRules", modalData()!.shiftId, undefined!);
            setTableData(
              "cells",
              cellIdGenerator(modalData()!.staff!, modalData()!.date),
              (items) => items.filter((item) => item !== modalData()!.shiftId)
            );
          });

          toastSuccess("Shift deleted successfully");
        } catch (e) {
          handleFetchError(e);
        } finally {
          toast.dismiss(t.id);
        }
      }
    );
  };

  const numOfErrors = createMemo(() =>
    showModal() && modalData()
      ? modalData()!.rules.filter((rule) => !rule.passed).length
      : 0
  );

  const openCreateCoverModal = () => {
    batch(() => {
      onCloseModal();
      setShowCreateCoverModal(true);
    });
  };

  return (
    <PopupModal.Wrapper
      title={
        state() === "details"
          ? "Shift Details"
          : state() === "edit"
            ? "Edit Shift"
            : state() === "errors"
              ? "Shift Errors"
              : "Copy Shift"
      }
      close={onCloseModal}
      open={showModal}
      headerTabs={
        user()?.role === Role.ADMIN
          ? [
            {
              name: "Details",
              stateName: "details",
              onClick: () => setState("details"),
            },
            {
              name: "Edit",
              stateName: "edit",
              onClick: () => setState("edit"),
            },
            {
              name: (
                <>
                  <span>Errors</span>
                  <Show when={numOfErrors() > 0}>
                    <div
                      class="h-3.5 w-3.5 inline-block text-[10px] leading-[14px] text-center font-semibold ml-1 rounded-full text-white bg-red-600">
                      {numOfErrors()}
                    </div>
                  </Show>
                </>
              ),
              stateName: "errors",
              onClick: () => setState("errors"),
            },
            {
              name: "Copy",
              stateName: "copy",
              onClick: () => setState("copy"),
            },
          ]
          : [
            {
              name: "Details",
              stateName: "details",
              onClick: () => setState("details"),
            },
            {
              name: (
                <>
                  <span>Errors</span>
                  <Show when={numOfErrors() > 0}>
                    <div
                      class="h-3.5 w-3.5 inline-block text-[10px] leading-[14px] text-center font-semibold ml-1 rounded-full text-white bg-red-600">
                      {numOfErrors()}
                    </div>
                  </Show>
                </>
              ),
              stateName: "errors",
              onClick: () => setState("errors"),
            },
          ]
      }
      headerTabSelected={state}
    >
      <Switch fallback={<div>Something wrong</div>}>
        <Match when={state() === "details"}>
          <Details
            shiftCard={modalData}
            setState={setState}
            onDelete={onDeleteShift}
            openCreateCoverModal={openCreateCoverModal}
          />
        </Match>
        <Match when={state() === "errors"}>
          <Errors
            shiftCard={modalData}
            setModalState={setState}
            onDelete={onDeleteShift}
            openCreateCoverModal={openCreateCoverModal}
          />
        </Match>
        <Match when={state() === "edit"}>
          <Edit
            modalState={state}
            setModalState={setState}
            setShiftModalData={setShiftModalData}
            setShowModal={setShowModal}
            modalData={modalData}
            onDelete={onDeleteShift}
            openCreateCoverModal={openCreateCoverModal}
          />
        </Match>
        <Match when={state() === "copy"}>
          <Copy
            shiftCard={modalData}
            setShowModal={setShowModal}
            setModalState={setState}
            onDelete={onDeleteShift}
          />
        </Match>
      </Switch>
    </PopupModal.Wrapper>
  );
};

export default ShiftDetailsModal;
