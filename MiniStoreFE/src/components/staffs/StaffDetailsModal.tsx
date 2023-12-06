import { FaSolidLock, FaSolidPencil, FaSolidUnlock } from "solid-icons/fa";
import { Component, createMemo, Show } from "solid-js";
import { useStaffContext } from "~/context/Staff";
import { useRouteData } from "@solidjs/router";
import { routeData } from "~/routes/staffs";
import { Role, StaffStatus } from "~/types";
import { A } from "solid-start";
import routes from "~/utils/routes";
import PopupModal from "~/components/PopupModal";
import formatNumberWithCommas from "~/utils/formatNumberWithCommas";

const StaffDetailsModal: Component = () => {
  const { setShowDetailsModal, showDetailsModal, chosenId, onDelete } = useStaffContext();
  const { data } = useRouteData<typeof routeData>();

  const staff =
    createMemo(
      () => !data.error && data() !== undefined
        ? data()?.content.find((t) => t.staffId === chosenId())
        : undefined
    )

  return (
    <PopupModal.Wrapper
      title="Staff Details"
      close={() => setShowDetailsModal(false)}
      open={showDetailsModal}
    >
      <PopupModal.Body>
        <div class="text-lg mb-2.5 font-semibold text-center text-gray-800">
          <p>{staff()?.staffName}</p>
          <p class="text-sm text-gray-400">ID: {staff()?.staffId}</p>
        </div>
        <div class="border-t border-gray-300 border-dotted text-gray-600 text-sm">
          <div class="flex border-b border-gray-300 border-dotted">
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">Email:</span>
              <span>{staff()?.email}</span>
            </div>
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">Username:</span>
              <span>{staff()?.username}</span>
            </div>
          </div>
          <div class="flex border-b border-gray-300 border-dotted">
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">Phone Number:</span>
              <span>{staff()?.phoneNumber}</span>
            </div>
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">Hourly Wage:</span>
              <span>{formatNumberWithCommas(staff()?.salary?.hourlyWage || 0)} ₫</span>
            </div>
          </div>
          <div class="flex border-b border-gray-300 border-dotted">
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">Role:</span>
              <span
                class="inline-block whitespace-nowrap px-2 py-0.5 text-xs text-center font-semibold rounded-full"
                classList={{
                  "bg-blue-200 text-blue-700": staff()?.role === Role.CASHIER,
                  "bg-yellow-200 text-yellow-700": staff()?.role === Role.GUARD,
                  "bg-red-200 text-red-700": staff()?.role === Role.MANAGER,
                  "bg-gray-200 text-gray-700": staff()?.role === Role.ADMIN || staff()?.role === Role.ALL_ROLES,
                }}
              >
                {staff()?.role}
              </span>
            </div>
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">Status:</span>
              <span
                class="inline-block whitespace-nowrap px-2 py-0.5 text-xs text-center font-semibold text-white rounded-full"
                classList={{
                  "bg-green-500": staff()?.status === StaffStatus.ACTIVATED,
                  "bg-red-500": staff()?.status === StaffStatus.DISABLED,
                }}
              >
                {staff()?.status === StaffStatus.ACTIVATED ? "Activated" : "Disabled"}
              </span>
            </div>
          </div>
          <div class="flex">
            <div class="flex-1 py-2.5 overflow-hidden space-x-1">
              <span class="font-semibold text-gray-500">Working days:</span>
              <span>{staff()?.workDays}</span>
            </div>
          </div>
        </div>
      </PopupModal.Body>
      <Show when={staff() !== undefined}>
        <PopupModal.Footer>
          <div class="flex w-full items-center justify-start gap-3">
            <A
              href={routes.staff(staff()!.staffId)}
              class="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-2"
            >
            <span class="">
              <FaSolidPencil/>
            </span>
              Edit Staff
            </A>
            <button class="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-2"
                    onClick={[ onDelete, staff() ]}>
              <Show
                when={staff()!.status === StaffStatus.ACTIVATED}
                fallback={<FaSolidUnlock/>}
              >
                <span>
                    <FaSolidLock/>
                </span>
              </Show>
              {staff()!.status === StaffStatus.ACTIVATED ? "Disable" : "Enable"}
            </button>
          </div>
        </PopupModal.Footer>
      </Show>
    </PopupModal.Wrapper>
  );
};
export default StaffDetailsModal;