import Dismiss from "solid-dismiss";
import { RiArrowsArrowDownSLine, RiArrowsArrowUpSLine } from "solid-icons/ri";
import { Component, createSignal, JSX, Show } from "solid-js";

const DropDownBtn: Component<{
  text: string;
  icon?: JSX.Element;
  children: JSX.Element;
  classList?: { [key: string]: boolean };
}> = (props) => {
  const [open, setOpen] = createSignal(false);
  let btnEl;

  return (
    <div class="relative">
      <button
        type="button"
        ref={btnEl}
        class="flex flex-row gap-2 justify-center items-center border border-gray-300 rounded-lg py-2 pl-3.5 pr-1 font-medium text-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-600"
      >
        <Show when={props.icon}>{props.icon}</Show>
        {props.text}
        <span class="text-lg">
          <Show when={!open()} fallback={<RiArrowsArrowUpSLine />}>
            <RiArrowsArrowDownSLine />
          </Show>
        </span>
      </button>
      <Dismiss menuButton={btnEl} open={open} setOpen={setOpen}>
        <div
          class="origin-top-right absolute right-0 top-11 z-40 rounded-lg shadow-lg border border-gray-200 bg-white shadow-xs"
          classList={
            props.classList ? props.classList : { "min-w-[200px]": true }
          }
        >
          {props.children}
        </div>
      </Dismiss>
    </div>
  );
};
export default DropDownBtn;
