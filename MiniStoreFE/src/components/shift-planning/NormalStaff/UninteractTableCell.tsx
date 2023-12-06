import { Component, For } from "solid-js";
import { Shift, Staff } from "~/types";
import UninteractCard from "~/components/shift-planning/NormalStaff/UninteractCard";

const UninteractTableCell: Component<{ items: Shift[]; staff: Staff; date: string }> = (props) => {

  return (
    <div
      class="flex flex-col border-r border-b border-gray-200 flex-1 overflow-hidden bg-[#f8fafc] pt-0.5 gap-y-0.5 relative"
    >
      <For each={props.items}>
        {(item) => (
          <UninteractCard
            shift={item}
            staff={props.staff}
            date={props.date}
          />
        )}
      </For>
      <div
        class="flex flex-1 text-gray-400 min-h-[20px] items-center justify-center font-bold my-3 opacity-0 hover:opacity-100 select-none">
      </div>
    </div>
  );
};

export default UninteractTableCell;

