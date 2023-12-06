import { Component, createSignal, onCleanup, onMount, Show } from "solid-js";
import { A, useSearchParams } from "solid-start";
import { ParamType } from "~/components/order/types";
import DropDownBtn from "~/components/DropDownBtn";
import { BiRegularDollar } from "solid-icons/bi";
import { FiCalendar } from "solid-icons/fi";
import { RiSystemCloseLine } from "solid-icons/ri";
import routes from "~/utils/routes";
import { Instance } from "flatpickr/dist/types/instance";

import { useAuth } from "~/context/Auth";
import { Role } from "~/types";

const ToolBar: Component = () => {
  const [searchParams, setSearchParams] = useSearchParams<ParamType>();
  const { user } = useAuth();
  const [dateStr, setDateStr] = createSignal<string>("");
  const [amountFrom, setAmountFrom] = createSignal<number>(
    Number.parseInt(searchParams.amount_from || "0")
  );
  const [amountTo, setAmountTo] = createSignal<number>(
    Number.parseInt(searchParams.amount_to || "0")
  );
  let dateRef: HTMLInputElement | undefined = undefined;
  let fp: Instance | undefined = undefined;

  onMount(() => {
    // @ts-ignore
    fp = flatpickr(dateRef!, {
      mode: "range",
      dateFormat: "Y-m-d",
      defaultDate: [searchParams.from, searchParams.to],
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
      // setSearchParams({ from: undefined, to: undefined });
      setDateStr("");
    }
    if (selectedDates.length === 2) {
      const start = instance.formatDate(selectedDates[0], "Y-m-d");
      const end = instance.formatDate(selectedDates[1], "Y-m-d");
      setSearchParams({
        from: start,
        to: end,
        ago: undefined,
      });

      const start2 = instance.formatDate(selectedDates[0], "F j");
      const end2 = instance.formatDate(selectedDates[1], "F j, Y");
      if (end2.startsWith(start2)) setDateStr(end2);
      else setDateStr(`${start2} - ${end2}`);
    }
  };

  const setGroupBtn = (ago: string | undefined) => {
    setSearchParams({ ago, from: undefined, to: undefined });
    fp?.clear();
  };

  return (
    <div class="mb-4 flex flex-row justify-between">
      <div class="flex flex-row gap-5 items-center">
        <div class="flex flex-row gap-1 bg-white border-gray-200 border rounded-lg p-1">
          <DateRangeButton text="All time" setParam={setGroupBtn} />
          <DateRangeButton
            text="12 months"
            param="12months"
            setParam={setGroupBtn}
          />
          <DateRangeButton
            text="30 days"
            param="30days"
            setParam={setGroupBtn}
          />
          <DateRangeButton text="7 days" param="7days" setParam={setGroupBtn} />
          <DateRangeButton
            text="24 hours"
            param="24hours"
            setParam={setGroupBtn}
          />
        </div>
        <Show when={user()?.role === Role.CASHIER}>
          <A
            href={routes.orderAdd}
            class="text-sm font-semibold text-white bg-indigo-600 py-2 px-3.5 rounded-lg hover:bg-indigo-700"
          >
            + Add Order
          </A>
        </Show>
      </div>
      <div class="flex justify-center items-center gap-4">
        <div class="flex justify-center items-center gap-2">
          <Show when={dateStr()}>
            <button
              class="text-base hover:text-indigo-700"
              onClick={() => {
                setDateStr("");
                setSearchParams({
                  from: undefined,
                  to: undefined,
                });
                fp?.clear();
              }}
            >
              <RiSystemCloseLine />
            </button>
          </Show>
          <button
            ref={dateRef}
            type="button"
            class="range_flatpicker flex flex-row gap-2 justify-center items-center border border-gray-300 rounded-lg py-2 px-3.5 font-medium text-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-600"
          >
            <FiCalendar />
            {dateStr() || "Select Dates"}
          </button>
        </div>
        <DropDownBtn text="Amount" icon={<BiRegularDollar />}>
          <div class="flex flex-col gap-2 justify-center items-center p-3 text-sm">
            <div class="w-full">
              <label for="amount_from" class="block">
                From: {amountFrom()} ₫
              </label>
              <input
                type="range"
                step={1000}
                min={0}
                max={1000000}
                id="amount_from"
                name="amount_from"
                value={searchParams.amount_from ?? "0"}
                onInput={(e) => {
                  const value = Number.parseInt(e.currentTarget.value);
                  setAmountFrom(value);
                  if (amountTo() < value) setAmountTo(value);
                }}
                class="w-full"
              />
            </div>
            <div class="w-full">
              <label for="amount_to" class="block">
                To: {amountTo() < amountFrom() ? amountFrom() : amountTo()} ₫
              </label>
              <input
                type="range"
                step={1000}
                min={amountFrom()}
                max={2000000}
                id="amount_to"
                name="amount_to"
                value={searchParams.amount_to ?? "0"}
                onInput={(e) => {
                  const value = Number.parseInt(e.currentTarget.value);
                  if (amountTo() < amountFrom()) setAmountTo(amountFrom());
                  else setAmountTo(value);
                }}
                class="w-full"
              />
            </div>
            <div class="w-full flex justify-end items-center">
              <button
                type="button"
                onClick={() => {
                  setAmountFrom(0);
                  setAmountTo(0);
                  setSearchParams({
                    amount_from: undefined,
                    amount_to: undefined,
                  });
                }}
                class="inline-block px-3 py-1 text-gray-600 text-center hover:text-black"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchParams({
                    amount_from: amountFrom(),
                    amount_to: amountTo(),
                  });
                }}
                class="inline-block px-3 py-1 font-medium text-center text-white bg-blue-500 border border-blue-500 rounded hover:bg-blue-600 hover:text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </DropDownBtn>
      </div>
    </div>
  );
};

export default ToolBar;

function DateRangeButton(props: {
  text: string;
  param?: string;
  setParam: (ago: string | undefined) => void;
}) {
  const { text, param, setParam } = props;
  const [searchParams] = useSearchParams<ParamType>();

  return (
    <button
      class="py-1 px-3 font-semibold rounded-md text-sm"
      classList={{
        "bg-indigo-100 text-indigo-700": searchParams.ago === param,
        "text-gray-500 hover:bg-indigo-50":
          !searchParams.ago || searchParams.ago !== param,
      }}
      onClick={() => setParam(param)}
    >
      {text}
    </button>
  );
}
