import { FaSolidPencil, FaSolidTrash } from "solid-icons/fa";
import { Accessor, Component, createMemo, Setter, Show } from "solid-js";
import PopupModal from "~/components/PopupModal";
import { Holiday, Role, Shift, TimesheetStatus } from "~/types";
import { Tabs } from ".";
import moment from "moment";
import { ShiftCard, useSPData } from "~/context/ShiftPlanning";
import { roles } from "~/utils/roles";
import { TbSpeakerphone } from "solid-icons/tb";
import { useAuth } from "~/context/Auth";

interface DetailsProps {
  shiftCard: Accessor<ShiftCard | undefined>;
  setState: Setter<Tabs>;
  onDelete: () => void;
  openCreateCoverModal: () => void;
}

const Details: Component<DetailsProps> = ({ shiftCard, setState, onDelete, openCreateCoverModal }) => {
  const { user } = useAuth();
  const { tableData } = useSPData();

  const attendance = () => shiftCard()?.timesheet?.status === TimesheetStatus.APPROVED
    ? "Attended"
    : moment(`${shiftCard()?.date} ${shiftCard()?.endTime}`).isBefore(moment())
      ? "Absent"
      : "Not yet"

  const isHoliday = (shift: Shift | undefined): Holiday | undefined => {
    if (!shift) return undefined;

    return tableData.holidays.find((holiday) => moment(shift.date, "YYYY-MM-DD")
      .isBetween(holiday.startDate, holiday.endDate, undefined, "[]"));
  }

  const holiday = createMemo(() => isHoliday(shiftCard()));

  const coefficient = createMemo(() => {
    return holiday() ? holiday()!.coefficient : shiftCard()?.salaryCoefficient || 0;
  });

  return (
    <>
      <PopupModal.Body>
        <div class="text-xl font-semibold text-center text-gray-800">
          {shiftCard()?.name}
        </div>
        <div
          class="text-sm mb-2.5 font-semibold text-center italic text-gray-500"
          classList={{ "text-green-600": shiftCard()?.published }}
        >
          {shiftCard()?.published ? "Published" : "Not Published"}
        </div>
        <Show when={shiftCard()?.shiftCoverRequest && user()?.role === Role.ADMIN}>
          <p class="text-center text-sm text-red-500">
            This shift has been reassigned
            for {
            tableData.staffs.find(s => s.staffId === shiftCard()?.shiftCoverRequest?.staffId)?.staffName
            || tableData.staffsInfo?.find(s => s.staffId === shiftCard()?.shiftCoverRequest?.staffId)?.staffName
          }.
          </p>
        </Show>
        <div class="border-t border-gray-300 border-dotted text-gray-600 text-sm">
          <div class="flex border-b border-gray-300 border-dotted">
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">Team Member:</span>
              <span>{shiftCard()?.staff!.staffName}</span>
            </div>
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">
                Salary Coefficient:
              </span>
              <span>{coefficient()}</span>
            </div>
          </div>
          <div class="flex border-b border-gray-300 border-dotted">
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">Required Role:</span>
              <span
                class="inline-block whitespace-nowrap px-2 py-0.5 text-xs text-center font-semibold rounded-full"
                classList={{
                  "bg-blue-200 text-blue-700": shiftCard()?.role === Role.CASHIER,
                  "bg-yellow-200 text-yellow-700": shiftCard()?.role === Role.GUARD,
                  "bg-red-200 text-red-700": shiftCard()?.role === Role.MANAGER,
                  "bg-gray-200 text-gray-700": shiftCard()?.role === Role.ADMIN,
                  "bg-gray-200 text-gray-800": shiftCard()?.role === Role.ALL_ROLES,
                }}
              >
                {roles.find((r) => r.value === shiftCard()?.role)?.label}
              </span>
            </div>
          </div>
          <div class="flex border-b border-gray-300 border-dotted">
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">Date:</span>
              <span>{moment(shiftCard()?.date).format("ddd MMM D, YYYY")}</span>
            </div>
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">Start Time:</span>
              <span>
                {moment(shiftCard()?.startTime, "h:mm:ss").format("h:mma")}
              </span>
            </div>
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">End Time:</span>
              <span>
                {moment(shiftCard()?.endTime, "h:mm:ss").format("h:mma")}
              </span>
            </div>
          </div>
          <div class="flex">
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">Status:</span>
              <span
                class="inline-flex justify-center items-center ml-1 rounded-lg"
                classList={{
                  "text-red-700": attendance() === "Not yet",
                  "text-red-700 font-semibold": attendance() === "Absent",
                  "text-green-700 font-semibold": attendance() === "Attended",
                }}
              >
                {attendance()}
              </span>
            </div>
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">Check-in Time:</span>
              <span>
                {shiftCard()?.timesheet?.checkInTime
                  ? moment(shiftCard()?.timesheet?.checkInTime, "HH:mm:ss").format("h:mm:ss a")
                  : "Not yet"}
              </span>
            </div>
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">Check-out Time:</span>
              <span>
                {shiftCard()?.timesheet?.checkOutTime
                  ? moment(shiftCard()?.timesheet?.checkOutTime, "HH:mm:ss").format("h:mm:ss a")
                  : "Not yet"}
              </span>
            </div>
          </div>
        </div>
        <Show when={holiday()}>
          <div class="border-t border-gray-300 border-dotted text-gray-600 text-sm">
            <label class="py-2.5 font-semibold text-gray-500 inline-block">
              Note
            </label>
            <p class="text-sm text-green-500 tracking-wide">
              This shift is on a holiday ({holiday()!.name}). The salary coefficient is readjusted to {coefficient()}
            </p>
          </div>
        </Show>
      </PopupModal.Body>
      <PopupModal.Footer>
        <div class="w-full flex justify-start items-center gap-3">
          <Show when={user()?.role === Role.ADMIN}>
            <button
              type="button"
              onClick={onDelete}
              class="flex gap-2 justify-center items-center text-gray-500 text-sm hover:text-gray-700 tracking-wide"
            >
            <span>
              <FaSolidTrash/>
            </span>
              <span>Delete</span>
            </button>
            <button
              type="button"
              onClick={[ setState, "edit" ]}
              class="flex gap-2 justify-center items-center text-gray-500 text-sm hover:text-gray-700 tracking-wide"
            >
            <span class="">
              <FaSolidPencil/>
            </span>
              Edit Shift
            </button>
          </Show>
          {/*<Show when={!shiftCard()?.shiftCoverRequest && shiftCard()?.staff === null}>*/}
            <button
              type="button"
              onClick={openCreateCoverModal}
              class="flex gap-2 justify-center items-center text-gray-500 text-sm hover:text-gray-700 tracking-wide"
            >
            <span class="text-base font-bold">
              <TbSpeakerphone/>
            </span>
              New Shift Cover
            </button>
          {/*</Show>*/}
        </div>
      </PopupModal.Footer>
    </>
  );
};

export default Details;
