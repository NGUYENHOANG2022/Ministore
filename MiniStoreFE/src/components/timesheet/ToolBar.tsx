import { AiOutlineSearch } from "solid-icons/ai";
import { useSearchParams } from "@solidjs/router";
import { ParamType } from "~/components/leave-requests/types";
import {
  Component,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
} from "solid-js";
import { FiCalendar } from "solid-icons/fi";

import moment from "moment";
import { Instance } from "flatpickr/dist/types/instance";

const ToolBar: Component = ({}) => {
  const [searchParams, setSearchParams] = useSearchParams<ParamType>();
  const [dateStr, setDateStr] = createSignal<string>("");
  let dateRef: HTMLInputElement | undefined = undefined;
  let fp: Instance | undefined = undefined;

  const onSearchSubmit = (e: Event) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = formData.get("search") as string;
    setSearchParams({ search: encodeURIComponent(search) });
  };

  createEffect(
    on([() => searchParams.from, () => searchParams.to], () => {
      if (searchParams.from === undefined || searchParams.to === undefined)
        fp?.setDate(moment().toDate(), true);
    })
  );

  onMount(() => {
    let from = searchParams.from
      ? moment(searchParams.from).format("YYYY-MM-DD")
      : moment().subtract(1, "month").format("YYYY-MM-DD");
    let to = moment(searchParams.to).format("YYYY-MM-DD");

    // @ts-ignore
    fp = flatpickr(dateRef!, {
      mode: "range",
      dateFormat: "Y-m-d",
      defaultDate: [from, to],
      onChange: updateDateStr,
      onReady: updateDateStr,
    });
  });

  onCleanup(() => {
    fp?.destroy();
  });

  const updateDateStr = (
    selectedDates: Date[],
    dateStr: string,
    instance: Instance
  ) => {
    if (selectedDates.length === 0) {
      setSearchParams({ from: undefined, to: undefined });
      setDateStr("");
    }
    if (selectedDates.length === 2) {
      const from = moment(selectedDates[0]);
      const to = moment(selectedDates[1]);
      setSearchParams({
        from: from.format("YYYY-MM-DD"),
        to: to.format("YYYY-MM-DD"),
      });
      const start = instance.formatDate(from.toDate(), "F j");
      const end = instance.formatDate(to.toDate(), "F j, Y");
      setDateStr(`${start} - ${end}`);
    }
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
            <AiOutlineSearch />
          </button>
        </form>
        <button
          ref={dateRef}
          type="button"
          class="range_flatpicker flex flex-row gap-2 justify-center items-center border border-gray-300 rounded-lg py-2 px-3.5 font-medium text-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-600"
        >
          <FiCalendar />
          {dateStr() || "Select Dates"}
        </button>
      </div>
    </div>
  );
};

export default ToolBar;
