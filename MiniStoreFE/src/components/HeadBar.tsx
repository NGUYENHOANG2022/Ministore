import { A } from "@solidjs/router";
import Dismiss from "solid-dismiss";
import { RiArrowsArrowDownSLine, RiArrowsArrowUpSLine } from "solid-icons/ri";
import { Component, createSignal, Show } from "solid-js";
import routes from "~/utils/routes";
import { useAuth } from "~/context/Auth";
import { capitalize } from "~/utils/capitalize";

type HeadBarProps = {
  isOpen: () => boolean;
  setIsNavOpen: (value: boolean) => void;
};

const HeadBar: Component<HeadBarProps> = (props) => {
  const { isOpen, setIsNavOpen } = props;
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  let btnEl;

  return (
    <nav class="flex flex-row justify-between items-center py-4 px-6 gap-4 h-[72px] bg-white border-b-1 border-gray-200 shadow-md">
      <button onClick={() => setIsNavOpen(!isOpen())}>
        <img alt="nav-button" src="/buger_icon.svg" class="bx bx-menu"></img>
      </button>
      <div class="relative ml-3">
        <div class="h-full items-center flex">
          <button
            ref={btnEl}
            class="text-sm rounded-full flex items-center justify-center gap-3"
          >
            <img
              class="h-8 w-8 rounded-full bg-gray-400"
              src={`https://api.dicebear.com/5.x/adventurer/svg?seed=${
                user()?.username
              }`}
              alt="Profile Image"
            />
            <div class="text-start hidden sm:block">
              <p class="font-semibold">{user()?.staffName}</p>
              <p class="text-xs text-gray-500 font-medium">
                {capitalize(user()?.role || "")}
              </p>
            </div>
            <span class="text-lg hidden sm:block">
              <Show
                when={!isDropdownOpen()}
                fallback={<RiArrowsArrowUpSLine />}
              >
                <RiArrowsArrowDownSLine />
              </Show>
            </span>
          </button>
        </div>
        <Dismiss
          menuButton={btnEl}
          open={isDropdownOpen}
          setOpen={setIsDropdownOpen}
        >
          <div class="origin-top-right absolute right-0 top-16 z-30 w-48 rounded-md shadow-lg border border-gray-200">
            <div class="py-1 rounded-md bg-white shadow-xs">
              <A
                href={routes.logout}
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </A>
            </div>
          </div>
        </Dismiss>
      </div>
    </nav>
  );
};

export default HeadBar;
