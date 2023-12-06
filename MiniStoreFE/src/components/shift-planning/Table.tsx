import {
  closestCenter,
  CollisionDetector,
  DragDropProvider,
  DragDropSensors,
  DragEventHandler,
  Draggable,
  DragOverlay,
  Droppable,
  Id,
} from "@thisbeyond/solid-dnd";
import moment from "moment";
import { batch, Component, For, Show } from "solid-js";
import { DataResponse, Role, Shift, ShiftCoverRequestStatus, TimesheetStatus, } from "~/types";
import TableCell from "./TableCell";
import { useSPData, useSPModals } from "~/context/ShiftPlanning";
import { shiftTimes } from "./utils/shiftTimes";
import { cellIdGenerator } from "./utils/cellIdGenerator";
import { capitalize } from "~/utils/capitalize";
import ShiftCard from "./ShiftCard";
import { sortBy } from "lodash";
import { getShiftMoveErrors } from "./utils/shiftRules";
import getShiftsByCellId from "./utils/getShiftsByCellId";
import { toastError, toastSuccess } from "~/utils/toast";
import getEndPoint from "~/utils/getEndPoint";
import handleFetchError from "~/utils/handleFetchError";
import { useAuth } from "~/context/Auth";
import UninteractTableCell from "~/components/shift-planning/NormalStaff/UninteractTableCell";
import axios from "axios";

// a cell is a droppable box
// a shift is a draggable item

type DnDTableProps = {};

const Table: Component<DnDTableProps> = (props) => {
  const { setStaffModalData, setShowStaffModal } = useSPModals();
  const { tableData, setTableData, isRouteDataLoading } = useSPData();
  const { user } = useAuth();

  // Get all droppable box ids
  const cellIds = () => Object.keys(tableData.cells);

  // Check if the id is a droppable box id
  const isCellId = (id: string) => cellIds().includes(id);

  // Find the droppable box id of a draggable id
  const getCellId = (shiftCardId: Id) => {
    for (let cellId in tableData.cells) {
      const shiftIds = tableData.cells[cellId];
      if (shiftIds.includes(shiftCardId as number)) {
        return cellId;
      }
    }

    // If the draggable id is not found in any droppable box
    return "";
  };

  const closestContainerOrItem: CollisionDetector = (
    draggable,
    droppables,
    context
  ) => {
    const closestContainer = closestCenter(
      draggable,
      droppables.filter((droppable) => isCellId(droppable.id as string)),
      context
    );
    if (closestContainer) {
      const containerItemIds = tableData.cells[closestContainer.id];
      const closestItem = closestCenter(
        draggable,
        droppables.filter((droppable) =>
          containerItemIds.includes(droppable.id as number)
        ),
        context
      );
      if (!closestItem) {
        return closestContainer;
      }

      if (getCellId(draggable.id) !== closestContainer.id) {
        const isLastItem =
          containerItemIds.indexOf(closestItem.id as number) ===
          containerItemIds.length - 1;

        if (isLastItem) {
          const belowLastItem =
            draggable.transformed.center.y > closestItem.transformed.center.y;

          if (belowLastItem) {
            return closestContainer;
          }
        }
      }
      return closestItem;
    }
    return null;
  };

  const move = async (
    draggable: Draggable,
    droppable: Droppable,
    onlyWhenChangingContainer = true
  ) => {
    // Get the droppable box id of the draggable
    const draggableCellId = getCellId(draggable.id);
    // Get the droppable box id of the droppable
    const droppableCellId = isCellId(droppable.id as string)
      ? (droppable.id as string)
      : getCellId(droppable.id);

    if (draggableCellId != droppableCellId || !onlyWhenChangingContainer) {
      const errors = getShiftMoveErrors(draggable, droppable, tableData);
      if (errors.length > 0) {
        toastError(errors[0].errorName);
        return;
      }

      console.log(tableData.shifts[draggable.id as number]);
      const newCellInfo = tableData.cellInfos[droppableCellId];

      const updatedShift = await updateShift({
        ...tableData.shifts[draggable.id as number],
        staffId: newCellInfo.staffId,
        date: newCellInfo.date,
      });
      if (!updatedShift) return;

      batch(() => {
        setTableData("shifts", updatedShift.shiftId, updatedShift);
        setTableData("cells", draggableCellId, (items) =>
          items.filter((item) => item !== draggable.id)
        );
        setTableData("cells", droppableCellId, (items) => {
          const sortedShifts = sortBy(
            [ ...items, draggable.id as number ],
            [ (shiftId) => tableData.shifts[shiftId].startTime ]
          );
          return [ ...sortedShifts ];
        });
      });

      toastSuccess("Shift updated successfully");
    }
  };

  const updateShift = async (shift: Shift) => {
    try {
      const { data } = await axios.put<DataResponse<Shift>>(
        `${getEndPoint()}/shifts/update/${shift.shiftId}`,
        shift
      );
      if (!data) throw new Error("Invalid response from server");
      console.log(data.content);

      return data.content;
    } catch (error: any) {
      handleFetchError(error);
      return null;
    }
  };

  const onDragEnd: DragEventHandler = async ({ draggable, droppable }) => {
    if (draggable && droppable) {
      await move(draggable, droppable);
    }
  };

  return (
    <div class="w-full">
      <div class="min-w-[1024px]">
        {/* Header */}
        <div class="sticky top-0 z-30 flex shadow-sm border border-gray-200 rounded-t-md">
          <div
            class="sticky left-0 z-30 px-3 py-2 flex flex-col justify-center border border-gray-200 w-48 flex-auto flex-grow-0 flex-shrink-0 overflow-visible bg-white"></div>
          <For each={tableData.dates}>
            {(date) => (
              <div
                class="px-3 py-2 flex flex-col justify-center border border-gray-200 flex-1 items-center overflow-hidden bg-white"
                classList={{ "animate-pulse": isRouteDataLoading() }}
              >
                <div class="font-semibold text-sm text-gray-600">
                  {moment(date).format("ddd, MMM D")}
                </div>
                {/*<div class="font-normal text-sm text-gray-400">*/}
                {/*  19.5 hrs / 0₫*/}
                {/*</div>*/}
              </div>
            )}
          </For>
        </div>

        {/* Body - Drag container */}
        <div class="relative shadow-sm border border-gray-200 border-t-0">
          <Show
            when={tableData.staffs.length !== 0 && user()?.role === Role.ADMIN}
          >
            <DragDropProvider
              onDragEnd={onDragEnd}
              collisionDetector={closestContainerOrItem}
            >
              <DragDropSensors/>
              {/* Row */}
              <For each={tableData.staffs}>
                {(staff) => (
                  <div class="flex">
                    <div
                      class="sticky left-0 z-10 px-3 py-1.5 flex flex-col border border-t-0 border-gray-200 w-48 flex-auto flex-grow-0 flex-shrink-0 overflow-visible bg-white">
                      <button
                        onClick={() => {
                          setStaffModalData(staff);
                          setShowStaffModal(true);
                        }}
                        class="font-semibold text-sm text-gray-600 text-start"
                      >
                        {staff.staffName}
                      </button>
                      <div class="font-normal text-sm text-gray-400">
                        {capitalize(staff.role)}
                      </div>
                    </div>
                    <For each={tableData.dates}>
                      {(date) => (
                        <TableCell
                          id={cellIdGenerator(staff, date)}
                          items={getShiftsByCellId(
                            cellIdGenerator(staff, date),
                            tableData
                          )}
                          staff={staff}
                          date={date}
                        />
                      )}
                    </For>
                  </div>
                )}
              </For>

              <DragOverlay>
                {/* @ts-ignore */}
                {(draggable) => {
                  let item = () => tableData.shifts[draggable?.id as number];
                  let selectedShiftWidth = () => draggable?.data?.width() - 4;
                  let isErrored = () =>
                    tableData.shiftsRules[draggable?.id as number].find(
                      (rule) => !rule.passed
                    ) !== undefined;
                  let attendance = () =>
                    tableData.shifts[draggable?.id as number]?.timesheet
                      ?.status === TimesheetStatus.APPROVED
                      ? "Attended"
                      : moment(
                        `${tableData.shifts[draggable?.id as number].date} ${
                          tableData.shifts[draggable?.id as number]?.endTime
                        }`
                      ).isBefore(moment())
                        ? "Absent"
                        : "Not yet";

                  return (
                    <ShiftCard
                      published={item().published}
                      loading={isRouteDataLoading}
                      role={item().role}
                      shiftDuration={shiftTimes(
                        item().startTime,
                        item().endTime
                      )}
                      shiftName={item().name}
                      style={{ width: `${selectedShiftWidth()}px` }}
                      isOverlay={true}
                      isErrored={isErrored()}
                      coveredShift={
                        !!item().shiftCoverRequest &&
                        item().shiftCoverRequest?.status ===
                        ShiftCoverRequestStatus.APPROVED
                      }
                      attendance={attendance}
                    />
                  );
                }}
              </DragOverlay>
            </DragDropProvider>
          </Show>
          <Show
            when={tableData.staffs.length !== 0 && user()?.role !== Role.ADMIN}
          >
            <For each={tableData.staffs}>
              {(staff) => (
                <div class="flex">
                  <div
                    class="sticky left-0 z-10 px-3 py-1.5 flex flex-col border border-t-0 border-gray-200 w-48 flex-auto flex-grow-0 flex-shrink-0 overflow-visible bg-white">
                    <button
                      onClick={() => {
                        setStaffModalData(staff);
                        setShowStaffModal(true);
                      }}
                      class="font-semibold text-sm text-gray-600 text-start"
                    >
                      {staff.staffName}
                    </button>
                    <div class="font-normal text-sm text-gray-400">
                      {capitalize(staff.role)}
                    </div>
                  </div>
                  <For each={tableData.dates}>
                    {(date) => (
                      <UninteractTableCell
                        items={getShiftsByCellId(
                          cellIdGenerator(staff, date),
                          tableData
                        )}
                        staff={staff}
                        date={date}
                      />
                    )}
                  </For>
                </div>
              )}
            </For>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default Table;
