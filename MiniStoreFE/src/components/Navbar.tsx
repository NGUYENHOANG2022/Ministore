import { children, Component, createSignal, JSX, Show } from "solid-js";
import { TiThLargeOutline } from "solid-icons/ti";
import { BiRegularShoppingBag } from "solid-icons/bi";
import { RiArrowsArrowDownSLine, RiArrowsArrowUpSLine } from "solid-icons/ri";
import { BsPeople } from "solid-icons/bs";
import { A } from "@solidjs/router";
import { Transition } from "solid-transition-group";
import routes from "~/utils/routes";
import { FiShoppingCart } from "solid-icons/fi";
import { IoCalendarOutline } from "solid-icons/io";
import { TbSpeakerphone, TbTrees } from "solid-icons/tb";
import { useAuth } from "~/context/Auth";
import { FaRegularCalendarCheck } from "solid-icons/fa";
import { Role } from "~/types";

type NavbarProps = {
  isOpen: () => boolean;
  setIsNavOpen: (value: boolean) => void;
};

const Navbar: Component<NavbarProps> = (props) => {
  const { isOpen } = props;
  const { user } = useAuth();

  return (
    <section
      class="w-64 h-screen bg-white z-10 overflow-x-hidden transition-all duration-300 flex flex-col items-start border-r-1 border-gray-200 shadow-lg"
      classList={{ "w-[76px]": !isOpen() }}
    >
      <A
        href={routes.dashboard}
        class="flex justify-start items-center py-2 px-5 gap-2.5 w-full h-16"
      >
        <img src="/Logo.png" alt="logo" />
        <span class="font-bold text-2xl" classList={{ hidden: !isOpen() }}>
          MiniStore
        </span>
      </A>
      <ul class="w-full flex flex-col items-start gap-2 px-[18px] py-6">
        {/* Dashboard */}
        <NavbarLink
          href={routes.dashboard}
          icon={<TiThLargeOutline />}
          text="Dashboard"
          isOpen={isOpen}
          end
        />

        {/* Shift planning */}
        <NavbarLink
          href={routes.shiftPlanning}
          icon={<IoCalendarOutline />}
          text="Shift&nbsp;Planning"
          isOpen={isOpen}
        />

        {/* Leave Requests*/}
        <NavbarLink
          href={routes.leaves}
          icon={<TbTrees />}
          text="Leave&nbsp;Requests"
          isOpen={isOpen}
        />

        {/* Shift Cover Requests*/}
        <NavbarLink
          href={routes.shiftCover}
          icon={<TbSpeakerphone />}
          text="Shift&nbsp;Cover&nbsp;Requests"
          isOpen={isOpen}
        />

        {/* Staff */}
        <Show when={user()?.role === Role.ADMIN}>
          <NavbarLink
            href={routes.staffs}
            icon={<BsPeople />}
            text="Staff&nbsp;Management"
            isOpen={isOpen}
          />
        </Show>

        {/* Attendance & Timesheets */}
        <Show when={user()?.role === Role.ADMIN}>
          <NavbarDropDown
            href={routes.attendance}
            isOpen={isOpen}
            icon={<FaRegularCalendarCheck />}
            text="Attendance"
          >
            <NavbarLink
              href={routes.attendance}
              text="Take&nbsp;Attendance"
              isOpen={isOpen}
            />
            <NavbarLink
              href={routes.timesheets}
              text="Timesheets"
              isOpen={isOpen}
            />
            <NavbarLink href={routes.payroll} text="Payroll" isOpen={isOpen} />
            <NavbarLink
              href={routes.holidays}
              text="Holidays"
              isOpen={isOpen}
            />
          </NavbarDropDown>
        </Show>

        <Show when={user()?.role !== Role.ADMIN}>
          <NavbarLink
            href={routes.attendance}
            text="Attendance"
            icon={<FaRegularCalendarCheck />}
            isOpen={isOpen}
          />
        </Show>

        {/* Product */}
        <Show
          when={user()?.role === Role.MANAGER || user()?.role === Role.CASHIER}
        >
          <NavbarDropDown
            href={routes.products}
            isOpen={isOpen}
            icon={<BiRegularShoppingBag />}
            text="Products"
          >
            <NavbarLink
              href={routes.products}
              text="Product&nbsp;List"
              isOpen={isOpen}
            />
            <NavbarLink
              href={routes.categories}
              text="Categories"
              isOpen={isOpen}
            />
          </NavbarDropDown>

          {/* Orders */}
          <NavbarLink
            href={routes.orders}
            icon={<FiShoppingCart />}
            text="Orders"
            isOpen={isOpen}
          />
        </Show>
      </ul>
    </section>
  );
};

export default Navbar;

interface NavbarLinkProps {
  href: string;
  isOpen: () => boolean;
  icon?: JSX.Element;
  text?: string;
  end?: boolean;
}

const NavbarLink: Component<NavbarLinkProps> = (props) => {
  const { href, isOpen, icon, text, end } = props;

  return (
    <li class="w-full">
      <A
        href={href}
        class="flex flex-row items-center py-2 px-[11px] gap-2 rounded-lg w-full font-semibold"
        classList={{
          "py-[11px]": !isOpen(),
        }}
        activeClass="bg-indigo-600 text-white"
        inactiveClass="text-gray-600 hover:bg-[#EFEFFD] hover:text-indigo-600"
        end={end}
      >
        <Show when={icon} fallback={<span class="w-[18px]"></span>}>
          {<span class="text-lg">{icon}</span>}
        </Show>
        <Show when={isOpen()}>
          <span>{text}</span>
        </Show>
      </A>
    </li>
  );
};

interface NavbarDropDownProps extends NavbarLinkProps {
  children?: JSX.Element | JSX.Element[];
}

const NavbarDropDown: Component<NavbarDropDownProps> = (props) => {
  const { href, isOpen, icon, text } = props;
  const [isDropdownOpen, setDropdownOpen] = createSignal(true);
  const child = children(() => props.children);

  const toggleProductDropdown = () => setDropdownOpen(!isDropdownOpen());

  return (
    <>
      <li class="w-full relative">
        <A
          href={href}
          class="text-gray-600 flex flex-row items-center py-2 px-[11px] gap-2 rounded-lg w-full font-semibold z-20"
          classList={{
            "py-[11px]": !isOpen(),
            "bg-[#EFEFFD] text-indigo-600": isDropdownOpen() && isOpen(),
          }}
          activeClass={
            !isOpen() || !isDropdownOpen()
              ? "bg-indigo-600 text-white"
              : "bg-[#EFEFFD] text-indigo-600"
          }
          inactiveClass="hover:bg-[#EFEFFD] hover:text-indigo-600"
        >
          <Show when={icon}>{<span class="text-lg">{icon}</span>}</Show>
          <span classList={{ hidden: !isOpen() }}>{text}</span>
        </A>
        <Transition
          onEnter={(el, done) => {
            const a = el.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: 300,
            });
            a.finished.then(done);
          }}
          onExit={(el, done) => {
            const a = el.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 100,
            });
            a.finished.then(done);
          }}
        >
          <Show when={isOpen()}>
            <button
              onClick={toggleProductDropdown}
              class="rounded text-lg hover:bg-indigo-300 absolute right-[11px] top-1/2 -translate-y-1/2"
            >
              <span class="text-lg">
                <Show
                  when={!isDropdownOpen()}
                  fallback={<RiArrowsArrowUpSLine />}
                >
                  <RiArrowsArrowDownSLine />
                </Show>
              </span>
            </button>
          </Show>
        </Transition>
      </li>
      <Show when={isOpen() && isDropdownOpen()}>{child()}</Show>
    </>
  );
};
