import { AiOutlineSearch } from "solid-icons/ai";
import { RiSystemAddFill } from "solid-icons/ri";
import { useSearchParams } from "@solidjs/router";
import { Component } from "solid-js";
import { ParamType } from "~/components/staffs/types";
import { useStaffContext } from "~/context/Staff";

const ToolBar: Component = () => {
  const [ searchParams, setSearchParams ] = useSearchParams<ParamType>();
  const { setShowCreateModal } = useStaffContext();

  const onSearchSubmit = (e: Event) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = formData.get("search") as string;
    setSearchParams({ search: encodeURIComponent(search) });
  };

  return (
    <div class="mb-4 flex flex-row justify-between">
      <div class="flex flex-row gap-5 items-center">
        <form class="relative" onSubmit={onSearchSubmit}>
          <input
            type="text"
            class="w-96 max-w-full border-gray-300 rounded-lg py-2 px-4 leading-tight pl-12 border-0 ring-1 ring-inset ring-gray-300 outline-0 focus:ring-1 focus:ring-inset focus:ring-indigo-600"
            placeholder="Search (type text, then press Enter)"
            name="search"
            value={decodeURIComponent(searchParams.search ?? "")}
          />
          <button
            class="absolute inset-y-0 left-0 flex items-center pl-4 text-lg"
            type="submit"
            title="Search"
          >
            <AiOutlineSearch/>
          </button>
        </form>

      </div>
      <div class="flex justify-center items-center">
        <button
          class="flex gap-1 justify-center items-center pl-3 pr-4 py-2 text-sm text-white bg-indigo-500 font-medium rounded-lg hover:bg-indigo-600"
          onClick={[ setShowCreateModal, true ]}
        >
            <span class="text-lg">
              <RiSystemAddFill/>
            </span>
          <span>New Staff</span>
        </button>
      </div>
    </div>
  )
}

export default ToolBar;
