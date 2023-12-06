import { FaSolidInfo } from "solid-icons/fa";
import { Component, Show, splitProps } from "solid-js";
import { Role } from "~/types";

interface ShiftCardProps {
  isActiveDraggable?: boolean;
  published: boolean;
  role: Role;
  shiftDuration: string;
  shiftName: string;
  loading: () => boolean;
  isOverlay?: boolean;
  coveredShift: boolean;
  onClick?: () => void;
  draggable?: any;
  style?: any;
  isErrored?: boolean;
  attendance: () => "Attended" | "Absent" | "Not yet";
}

const ShiftCard: Component<ShiftCardProps> = (props) => {
  const [ local, rest ] = splitProps(props, [
    "isActiveDraggable",
    "published",
    "role",
    "shiftDuration",
    "shiftName",
    "loading",
    "isOverlay",
    "draggable",
    "isErrored",
    "coveredShift",
    "attendance"
  ]);

  const fs = () => {
  };
  const draggable = local.draggable || fs; // DO NOT REMOVE THIS LINE

  return (
    <button
      {...rest}
      // @ts-ignore
      use:draggable
      type="button"
      class="rounded mx-0.5 px-1.5 py-1 relative text-left select-none"
      classList={{
        "opacity-25": local.isActiveDraggable,
        "bg-white hover:bg-[#edf2f7] text-black border border-gray-200": local.published && !local.coveredShift,
        "bg-[#efedfc] hover:bg-[#e4e0fa] text-[#7256e8] border border-[#efedfc]": local.published && local.coveredShift,
        "bg-[repeating-linear-gradient(-45deg,white,white_5px,#eff4f8_5px,#eff4f8_10px)] hover:bg-[repeating-linear-gradient(-45deg,white,white_5px,#eaf0f6_5px,#eaf0f6_10px)] border border-gray-200":
          !local.published && !local.coveredShift,
        "bg-[repeating-linear-gradient(-45deg,#efedfc,#efedfc_5px,#e4e0fa_5px,#e4e0fa_10px)] hover:bg-[repeating-linear-gradient(-45deg,#efedfc,#efedfc_5px,#d9d3f8_5px,#d9d3f8_10px)] border border-gray-200":
          !local.published && local.coveredShift,
        "animate-pulse": local.loading(),
        "z-40": local.isOverlay,
      }}
    >
      <i
        class="absolute top-1 left-1 bottom-1 w-1.5 rounded"
        classList={{
          "bg-blue-500": local.role === Role.CASHIER,
          "bg-yellow-500": local.role === Role.GUARD,
          "bg-red-500": local.role === Role.MANAGER,
          "bg-gray-600": local.role === Role.ADMIN,
          "bg-gray-400": local.role === Role.ALL_ROLES,
        }}
      ></i>
      <p class="ml-3 font-semibold text-sm">{local.shiftDuration}</p>
      <p class="ml-3 font-normal text-xs text-gray-600">
        {local.shiftName}{" "}
        <span classList={{
          "text-green-500 font-semibold": local.attendance() === "Attended",
          "text-red-500 font-semibold": local.attendance() === "Absent",
          "text-gray-400": local.attendance() === "Not yet",
        }}>
          ({local.attendance()})
        </span>
      </p>
      <Show when={local.isErrored}>
        <div
          class="absolute top-1 right-1 h-3 w-3 inline-flex text-[10px] leading-[14px] justify-center items-center font-semibold ml-1 rounded-full text-white bg-red-600">
          <FaSolidInfo/>
        </div>
      </Show>
    </button>
  );
};
export default ShiftCard;
