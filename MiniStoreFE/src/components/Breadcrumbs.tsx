import { A } from "@solidjs/router";
import { RiArrowsArrowRightSLine } from "solid-icons/ri";
import { Component, For, Show } from "solid-js";
import routes from "~/utils/routes";

const Breadcrumbs: Component<{
  linkList: { name: string; link?: string }[];
}> = (props) => {
  const { linkList } = props;

  return (
    <div class="flex flex-row justify-start items-center text-sm gap-3 font-medium mb-6">
      <A href={routes.dashboard} class="text-indigo-600">
        Dashboard
      </A>
      <For each={linkList}>
        {(item) => (
          <>
            <span class="text-gray-500 text-lg">
              <RiArrowsArrowRightSLine />
            </span>
            <Show
              when={item.link}
              fallback={<span class="text-gray-500">{item.name}</span>}
            >
              <A href={item.link!} class="text-indigo-600">
                {item.name}
              </A>
            </Show>
          </>
        )}
      </For>
    </div>
  );
};

export default Breadcrumbs;
