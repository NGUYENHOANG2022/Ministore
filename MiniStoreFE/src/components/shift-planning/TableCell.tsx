import { createDroppable, useDragDropContext } from "@thisbeyond/solid-dnd";
import { Component, createEffect, For, on, Show } from "solid-js";
import { Shift, Staff } from "~/types";
import DraggableCard from "./DraggableCard";
import { useSPData, useSPModals } from "~/context/ShiftPlanning";
import { getShiftMoveErrors } from "./utils/shiftRules";
import isDayInThePast from "../../utils/isDayInThePast";
import { checkOverlapWithLeaveRequest } from "~/components/shift-planning/utils/checkOverlapWithLeaveRequest";
import { toastError } from "~/utils/toast";

const TableCell: Component<{
  id: string;
  items: Shift[];
  staff: Staff;
  date: string;
}> = (props) => {
  const { setShowNewShiftModal, setNewShiftModalData } = useSPModals();
  const { tableData } = useSPData();

  const droppable = createDroppable(props.id, {
    staffId: props.staff.staffId,
    staff: props.staff,
    date: props.date,
  });
  const [ state ] = useDragDropContext() || [];
  let divRef: HTMLDivElement | undefined = undefined;

  createEffect(
    on(
      () => props.items.length,
      () => {
        // console.log(props.id);
      }
    )
  );

  const onAddNewShift = () => {
    if (checkOverlapWithLeaveRequest(tableData, props.staff.staffId, props.date)) {
      toastError("This staff has a leave request on this day.");
      return;
    }
    setShowNewShiftModal(true);
    setNewShiftModalData({
      staff: props.staff,
      date: props.date,
    });
  };

  return (
    <div
      // @ts-ignore
      use:droppable
      ref={divRef}
      class="flex flex-col border-r border-b border-gray-200 flex-1 overflow-hidden bg-[#f8fafc] pt-0.5 gap-y-0.5 relative"
    >
      <For each={props.items}>
        {(item) => (
          <DraggableCard
            shift={item}
            width={() => divRef?.offsetWidth}
            staff={props.staff}
            date={props.date}
          />
        )}
      </For>
      <Show
        when={!isDayInThePast(props.date)}
        fallback={
          <div
            class="flex flex-1 text-gray-400 min-h-[20px] items-center justify-center font-bold my-3 opacity-0 hover:opacity-100 select-none"></div>
        }
      >
        <button
          onClick={onAddNewShift}
          class="flex flex-1 text-gray-400 min-h-[20px] items-center justify-center font-bold my-3 opacity-0 hover:opacity-100 cursor-pointer select-none"
          disabled={!!state?.active.draggable}
        >
          +
        </button>
      </Show>

      <Show when={droppable.isActiveDroppable}>
        <Show
          when={
            state &&
            getShiftMoveErrors(
              state.active.draggable!,
              state.active.droppable!,
              tableData
            ).length !== 0
          }
          fallback={
            <div class="bg-sky-200 bg-opacity-50 absolute inset-0"></div>
          }
        >
          <div class="bg-red-300 bg-opacity-50 absolute inset-0"></div>
        </Show>
      </Show>
    </div>
  );
};

export default TableCell;
