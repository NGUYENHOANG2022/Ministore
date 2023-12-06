import { Component, createSignal, JSX } from "solid-js";
import HeadBar from "~/components/HeadBar";
import Navbar from "~/components/Navbar";

const DashboardLayout: Component<{ children: JSX.Element }> = (props) => {
  const [ isNavOpen, setIsNavOpen ] = createSignal(true);

  return (
    <div class="flex flex-row h-screen">
      <Navbar isOpen={isNavOpen} setIsNavOpen={setIsNavOpen}/>
      <div class="flex-1 overflow-x-auto flex flex-col">
        <HeadBar isOpen={isNavOpen} setIsNavOpen={setIsNavOpen}/>
        <div class="relative flex-1 overflow-auto flex flex-col justify-between">
          <div class="py-8 px-6 min-w-[1024px] h-fit">{props.children}</div>
          <div class="text-center min-w-[1024px] py-2 text-gray-400 text-sm">©{new Date().getFullYear()} MiniStore. All rights reserved</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
