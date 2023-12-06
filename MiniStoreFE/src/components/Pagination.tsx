import { Component, For, Show } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { ParamType } from "~/components/leave-requests/types";

type PaginationProps = {
  totalItems: () => number;
};

const Pagination: Component<PaginationProps> = ({ totalItems }) => {
  const [ searchParams, setSearchParams ] = useSearchParams<ParamType>();

  const perPage = () => Number.parseInt(searchParams.perPage || "10");
  const curPage = () => Number.parseInt(searchParams.curPage || "1");
  const lastPage = () => Math.ceil(totalItems() / perPage());

  const prev = () => {
    setSearchParams({ curPage: Math.max(1, curPage() - 1) });
  };

  const next = () => {
    setSearchParams({ curPage: Math.min(lastPage(), curPage() + 1) });
  };

  const setPage = (page: number) => {
    setSearchParams({ curPage: Math.max(1, Math.min(lastPage(), page)) });
  };

  return (
    <Show when={totalItems() > 0}>
      <div class="flex items-center justify-between px-4 py-3 sm:px-6">
        <div class="flex flex-1 justify-start gap-3 sm:hidden">
          <button
            onClick={prev}
            disabled={curPage() === 1}
            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={next}
            disabled={curPage() === lastPage()}
            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing{" "}
              <span class="font-medium">
              {(curPage() - 1) * perPage() + 1 > totalItems()
                ? totalItems()
                : (curPage() - 1) * perPage() + 1 < 0
                  ? 0
                  : (curPage() - 1) * perPage() + 1}
            </span>{" "}
              to{" "}
              <span class="font-medium">
              {(curPage() - 1) * perPage() + perPage() > totalItems()
                ? totalItems()
                : (curPage() - 1) * perPage() + perPage()}
            </span>{" "}
              of <span class="font-medium">{totalItems()}</span> results
            </p>
          </div>
          <div>
            <div>
              <nav class="isolate inline-flex gap-1" aria-label="Pagination">
                <button
                  onClick={prev}
                  disabled={curPage() === 1}
                  class="relative inline-flex shadow-sm w-8 h-8 justify-center items-center rounded-lg font-semibold bg-white text-indigo-500 ring-1 ring-inset ring-gray-300 hover:bg-indigo-100 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:bg-white"
                >
                  <span class="sr-only">Previous</span>
                  <svg
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
                <For each={Array.from({ length: 5 }, (_, i) => i + 1)}>
                  {(pageNumber) => (
                    <Show
                      when={
                        curPage() + pageNumber - 3 > 0 &&
                        curPage() + pageNumber - 3 <= lastPage()
                      }
                    >
                      <button
                        onClick={() => setPage(curPage() + pageNumber - 3)}
                        disabled={curPage() === curPage() + pageNumber - 3}
                        class="relative inline-flex shadow-sm w-8 h-8 justify-center items-center font-semibold rounded-lg ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0"
                        classList={{
                          "bg-indigo-500 text-white focus:outline-none focus:ring":
                            curPage() === curPage() + pageNumber - 3,
                          "text-indigo-500 bg-white hover:bg-indigo-100":
                            curPage() !== curPage() + pageNumber - 3,
                        }}
                      >
                        {curPage() + pageNumber - 3}
                      </button>
                    </Show>
                  )}
                </For>
                <button
                  onClick={next}
                  disabled={curPage() === lastPage()}
                  class="relative inline-flex shadow-sm w-8 h-8 justify-center items-center font-semibold rounded-lg bg-white text-indigo-500 ring-1 ring-inset ring-gray-300 hover:bg-indigo-100 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:bg-white"
                >
                  <span class="sr-only">Next</span>
                  <svg
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default Pagination;
