import {
  Accessor,
  Component,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
  Setter,
} from "solid-js";
import { useSearchParams } from "solid-start";
import DropDownBtn from "../DropDownBtn";
import { IoCopySharp } from "solid-icons/io";
import {
  FaSolidAngleLeft,
  FaSolidAngleRight,
  FaSolidRepeat,
} from "solid-icons/fa";
import { FiCalendar } from "solid-icons/fi";
import moment from "moment";

import { getWeekFirstAndLastDates } from "~/utils/getWeekDates";
import { useSPData, useSPModals } from "~/context/ShiftPlanning";
import { ParamType } from "./utils/types";
import { useAuth } from "~/context/Auth";
import { Role } from "~/types";
import { Instance } from "flatpickr/dist/types/instance";

type ToolBarProps = {
  datePicked: Accessor<string | undefined>;
  setDatePicked: Setter<string | undefined>;
};

const ToolBar: Component<ToolBarProps> = ({ datePicked, setDatePicked }) => {
  const [searchParams, setSearchParams] = useSearchParams<ParamType>();
  const [dateStr, setDateStr] = createSignal<string>("");
  const { resetTableData } = useSPData();
  const { user } = useAuth();
  const { setShowShiftTemplateModal, setScheduleTemplateModalState } =
    useSPModals();

  let dateRef: HTMLInputElement | undefined = undefined;
  let fp: Instance | undefined = undefined;

  createEffect(
    on(
      () => searchParams.picked_date,
      () => {
        if (searchParams.picked_date === undefined)
          fp?.setDate(moment().toDate(), true);
      }
    )
  );

  onMount(() => {
    const p = moment(searchParams.picked_date);
    const defaultDate = p.isValid()
      ? p.format("YYYY-MM-DD")
      : moment().format("YYYY-MM-DD");
    setDatePicked(defaultDate);

    // @ts-ignore
    fp = flatpickr(dateRef!, {
      mode: "single",
      dateFormat: "Y-m-d",
      defaultDate: defaultDate,
      onChange: updateDateStr,
      onReady: updateDateStr,
    });
  });

  onCleanup(() => {
    // console.log("clean up");
    fp?.destroy();
    resetTableData();
  });

  const updateDateStr = (
    selectedDates: Date[],
    dateStr: string,
    instance: Instance
  ) => {
    if (selectedDates.length === 0) {
      setDatePicked(undefined);
      setSearchParams({ picked_date: undefined });
      setDateStr("");
    }
    if (selectedDates.length === 1) {
      const pickedDate = dateStr;
      const [from, to] = getWeekFirstAndLastDates(pickedDate);
      setDatePicked(pickedDate);
      setSearchParams({ picked_date: pickedDate });
      const start = instance.formatDate(from.toDate(), "F j");
      const end = instance.formatDate(to.toDate(), "F j, Y");
      setDateStr(`${start} - ${end}`);
    }
  };

  const goToPrevWeek = () => {
    const pickedDate = moment(datePicked());
    const [from] = getWeekFirstAndLastDates(
      pickedDate.subtract(1, "week").format()
    );
    fp?.setDate(from.toDate(), true);
  };

  const goToNextWeek = () => {
    const pickedDate = moment(datePicked());
    const [from] = getWeekFirstAndLastDates(pickedDate.add(1, "week").format());
    fp?.setDate(from.toDate(), true);
  };

  const isAdmin = () => user()?.role === Role.ADMIN;

  return (
    <div class="mb-4 flex flex-row justify-between">
      <div
        class="flex flex-row gap-5 items-center"
        classList={{ hidden: !isAdmin() }}
      >
        <button
          type="button"
          onClick={[setShowShiftTemplateModal, true]}
          class="flex flex-row items-center gap-1 cursor-pointer border border-gray-300 rounded-lg py-2 px-3.5 font-medium text-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-600"
        >
          <span class="text-base">
            <FaSolidRepeat />
          </span>
          Shift Templates
        </button>
      </div>
      <div
        class="flex justify-center items-center gap-2"
        classList={{ "w-full": !isAdmin() }}
      >
        <button
          type="button"
          onClick={goToPrevWeek}
          class="flex justify-center items-center border border-gray-300 rounded-lg py-2 px-3.5 font-medium text-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-600"
        >
          <FaSolidAngleLeft size={20} />
        </button>
        <button
          ref={dateRef}
          type="button"
          class="range_flatpicker flex flex-row gap-2 justify-center items-center border border-gray-300 rounded-lg py-2 px-3.5 font-medium text-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-600"
        >
          <FiCalendar />
          {dateStr() || "Select Dates"}
        </button>
        <button
          type="button"
          onClick={goToNextWeek}
          class="flex justify-center items-center border border-gray-300 rounded-lg py-2 px-3.5 font-medium text-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-600"
        >
          <FaSolidAngleRight size={20} />
        </button>
      </div>
      <div
        class="flex justify-center items-center gap-4"
        classList={{ hidden: !isAdmin() }}
      >
        <DropDownBtn
          text="Copy"
          icon={<IoCopySharp />}
          classList={{
            "w-fit flex flex-col items-stretch": true,
          }}
        >
          <button
            type="button"
            onClick={[setScheduleTemplateModalState, "copy"]}
            class="py-1.5 px-2.5 text-sm text-start text-gray-600 hover:bg-gray-100 whitespace-nowrap block"
          >
            Copy Previous Week
          </button>
          <button
            type="button"
            onClick={[setScheduleTemplateModalState, "create"]}
            class="py-1.5 px-2.5 text-sm text-start text-gray-600 hover:bg-gray-100 whitespace-nowrap block"
          >
            Create Week Template
          </button>
          <button
            type="button"
            onClick={[setScheduleTemplateModalState, "list"]}
            class="py-1.5 px-2.5 text-sm text-start text-gray-600 hover:bg-gray-100 whitespace-nowrap block"
          >
            Apply Week Template
          </button>
        </DropDownBtn>
      </div>
    </div>
  );
};

export default ToolBar;
