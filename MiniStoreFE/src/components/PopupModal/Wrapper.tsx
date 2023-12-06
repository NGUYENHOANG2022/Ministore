import { CgClose } from "solid-icons/cg";
import { Accessor, Component, For, JSX, Show } from "solid-js";

type Props = {
  open: () => boolean;
  close: () => void;
  title: string | JSX.Element;
  children: JSX.Element;
  headerTabs?: {
    name: string | JSX.Element;
    stateName: string;
    onClick: () => void;
  }[];
  headerTabSelected?: Accessor<string>;
  width?: string;
};

const Wrapper: Component<Props> = (props) => {
  return (
    <Show when={props.open()}>
      <div
        class="fixed inset-0 z-40 bg-black bg-opacity-50 overflow-y-auto overflow-x-hidden sm:justify-end sm:p-5"
        aria-modal="true"
        onClick={(e) => {
          if (e.target.ariaModal) props.close();
        }}
      >
        <div
          class="zoom-in col-span-1 bg-white shadow-md min-w-fit min-h-[100px] rounded-md mx-auto my-8 flex flex-col"
          style={{ width: props.width ?? "600px" }}>
          {/* Header */}
          <div class="py-3.5 px-5 rounded-t-md border-b border-gray-300 text-gray-600 bg-gray-50">
            <div class="flex justify-between items-center flex-wrap font-semibold">
              {props.title}
              <button
                onClick={props.close}
                class="text-xl hover:text-indigo-700"
              >
                <CgClose/>
              </button>
            </div>
            <Show when={props.headerTabs && props.headerTabSelected?.()}>
              <div class="flex mt-1 -mb-[15px] text-sm">
                <For each={props.headerTabs}>
                  {(tab) => (
                    <button
                      class="text-gray-600 hover:text-[#00a8ff] p-0 h-8 mr-4 transition-colors flex justify-center items-center"
                      onClick={tab.onClick}
                      classList={{
                        "font-semibold border-b-[3px] border-[#00a8ff] text-[#00a8ff]":
                          tab.stateName === props.headerTabSelected?.(),
                      }}
                    >
                      {tab.name}
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </div>

          {/* Body */}
          {props.children}
        </div>
      </div>
    </Show>
  );
};

export default Wrapper;
