import { useFormHandler } from "solid-form-handler";
import { yupSchema } from "solid-form-handler/yup";
import { FaSolidPencil, FaSolidTrash } from "solid-icons/fa";
import { Accessor, Component, createSignal, Setter, Show } from "solid-js";
import PopupModal from "~/components/PopupModal";
import { Checkboxes } from "~/components/form/Checkboxes";
import { TextInput } from "~/components/form/TextInput";
import { ShiftCard, useSPData } from "~/context/ShiftPlanning";
import { DataResponse, Role, Shift } from "~/types";
import { Tabs } from ".";
import { shiftDetailsTime } from "../utils/shiftTimes";
import * as yup from "yup";
import moment from "moment";
import { toastError, toastSuccess } from "~/utils/toast";
import handleFetchError from "~/utils/handleFetchError";
import isDayInThePast from "~/utils/isDayInThePast";
import { getWeekDateStings } from "~/utils/getWeekDates";
import getDatesUntilWeek from "~/utils/getDatesUtilWeek";
import axios from "axios";
import getEndPoint from "~/utils/getEndPoint";

type CopyScheduleForm = {
  days: string[];
  untilDate?: string;
};
const copySchema: yup.Schema<CopyScheduleForm> = yup.object({
  days: yup.array(yup.string().required()).required(),
  untilDate: yup.string(),
});

interface CopyProps {
  shiftCard: Accessor<ShiftCard | undefined>;
  setModalState: Setter<Tabs>;
  setShowModal: Setter<boolean>;
  onDelete: () => void;
}

const Copy: Component<CopyProps> = ({ shiftCard, setModalState, onDelete, setShowModal }) => {
  const { saveChanges } = useSPData();
  const [ enableMultiWeeks, setEnableMultiWeeks ] = createSignal<boolean>(false);
  const [ coping, setCoping ] = createSignal<boolean>(false);
  const formHandler = useFormHandler(yupSchema(copySchema));
  const { formData } = formHandler;

  const weekDays = getWeekDateStings(shiftCard()?.date);
  const workDay = moment(shiftCard()?.date).format("dddd");

  const submit = async (publish: boolean, event: Event) => {
    event.preventDefault();
    if (coping() || shiftCard() === undefined) return;

    try {
      if (enableMultiWeeks() && (!formData().untilDate || moment(formData().untilDate).isBefore(moment()))) {
        toastError("The until date is not valid. Please select a date in the future.");
        return;
      }
      let shifts: Shift[];

      const confirm = window.confirm("Only days that are not in the past will create shifts. Continue?");
      if (!confirm) return;

      if (enableMultiWeeks()) {
        shifts = getDatesUntilWeek(formData().days, formData().untilDate!, shiftCard()?.date!)
          .filter(d => d !== shiftCard()?.date && !isDayInThePast(d))
          .map((date) => {
            return {
              date,
              staffId: shiftCard()?.staffId,
              published: publish,
              startTime: shiftCard()?.startTime,
              endTime: shiftCard()?.endTime,
              name: shiftCard()?.name,
              salaryCoefficient: shiftCard()?.salaryCoefficient,
              role: shiftCard()?.role
            } as Shift;
          })
      } else {
        shifts = formData().days.filter(d => d !== shiftCard()?.date && !isDayInThePast(d)).map((date) => {
          return {
            date,
            staffId: shiftCard()?.staffId,
            published: publish,
            startTime: shiftCard()?.startTime,
            endTime: shiftCard()?.endTime,
            name: shiftCard()?.name,
            salaryCoefficient: shiftCard()?.salaryCoefficient,
            role: shiftCard()?.role
          } as Shift;
        })
      }

      setCoping(true);

      const response = await axios.post<DataResponse<Shift[]>>(`${getEndPoint()}/shifts/add/multiple`, shifts);

      if (!response.data) throw new Error("Invalid response from server");

      toastSuccess("Shifts are created successfully");
      saveChanges();
      setShowModal(false);
    } catch (error: any) {
      handleFetchError(error);
    } finally {
      setCoping(false);
    }
  };

  const reset = () => {
    formHandler.resetForm();
  };

  const onCancel = () => {
    reset();
    setModalState("details");
  };

  return (
    <>
      <PopupModal.Body>
        <div class="p-5 mb-5 -mx-5 -mt-5 border-b border-gray-200">
          <div
            class="rounded mx-0.5 p-2 relative text-left select-none"
            classList={{
              "bg-[#edf2f7] text-black": shiftCard()?.published,
              "bg-[repeating-linear-gradient(-45deg,white,white_5px,#eaf0f6_5px,#eaf0f6_10px)] border border-gray-200":
                !shiftCard()?.published,
            }}
          >
            <i
              class="absolute top-1 left-1.5 bottom-1 w-1.5 rounded"
              classList={{
                "bg-blue-500": shiftCard()?.role === Role.CASHIER,
                "bg-yellow-500": shiftCard()?.role === Role.GUARD,
                "bg-red-500": shiftCard()?.role === Role.MANAGER,
                "bg-gray-600": shiftCard()?.role === Role.ADMIN,
                "bg-gray-400": shiftCard()?.role === Role.ALL_ROLES,
              }}
            ></i>
            <p class="ml-3.5 font-semibold text-sm tracking-wider">
              {shiftDetailsTime(
                shiftCard()?.date || "",
                shiftCard()?.startTime || "",
                shiftCard()?.endTime || ""
              )}
            </p>
            <p class="ml-3.5 font-normal text-xs tracking-wider">
              {shiftCard()?.name}
            </p>
          </div>
        </div>
        <div class="mb-4 w-[560px]">
          <label class="mb-1.5 font-semibold text-gray-600 inline-block">
            Copy to Other Weekdays
          </label>
          <div class="border border-gray-200 rounded-sm flex flex-col overflow-hidden">
            <div class="max-h-[180px] overflow-y-scroll">
              <Checkboxes
                name="days"
                class="p-2.5 text-sm"
                options={[
                  {
                    label: "Monday",
                    value: weekDays[0],
                    disabled: workDay === "Monday" || (isDayInThePast(weekDays[0]) && !enableMultiWeeks()),
                  },
                  {
                    label: "Tuesday",
                    value: weekDays[1],
                    disabled: workDay === "Tuesday" || (isDayInThePast(weekDays[1]) && !enableMultiWeeks()),
                  },
                  {
                    label: "Wednesday",
                    value: weekDays[2],
                    disabled: workDay === "Wednesday" || (isDayInThePast(weekDays[2]) && !enableMultiWeeks()),
                  },
                  {
                    label: "Thursday",
                    value: weekDays[3],
                    disabled: workDay === "Thursday" || (isDayInThePast(weekDays[3]) && !enableMultiWeeks()),
                  },
                  {
                    label: "Friday",
                    value: weekDays[4],
                    disabled: workDay === "Friday" || (isDayInThePast(weekDays[4]) && !enableMultiWeeks()),
                  },
                  {
                    label: "Saturday",
                    value: weekDays[5],
                    disabled: workDay === "Saturday" || (isDayInThePast(weekDays[5]) && !enableMultiWeeks()),
                  },
                  {
                    label: "Sunday",
                    value: weekDays[6],
                    disabled: workDay === "Sunday" || (isDayInThePast(weekDays[6]) && !enableMultiWeeks()),
                  },
                ]}
                value={[ shiftCard()!.date ]}
                formHandler={formHandler}
              />
            </div>
          </div>
          <p class="text-gray-400 text-sm tracking-wide">
            Select the other weekdays you would like to copy this shift to. This
            shift is currently scheduled on {workDay}, which
            is why you can't deselect{" "}
            {workDay.length > 1 ? "those options" : "this option"}.
          </p>
        </div>
        <div class="mb-4 w-[560px] flex justify-between items-center">
          <div>
            <label class="mb-1.5 font-semibold text-gray-600 inline-block">
              Copy to Future Weeks
            </label>
            <p class="text-gray-400 text-sm tracking-wide">
              Copy this shift to future weeks too.
            </p>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              checked={enableMultiWeeks()}
              onChange={async () => {
                // await formHandler.resetForm();
                setEnableMultiWeeks(!enableMultiWeeks());
              }}
            />
            <span class="slider round"></span>
          </label>
        </div>
        <Show when={enableMultiWeeks()}>
          <div class="mb-4 flex flex-col items-start">
            <label
              for="untilDate"
              class="mb-1.5 font-semibold text-gray-600 inline-block"
            >
              Until
            </label>
            <TextInput
              id="untilDate"
              name="untilDate"
              class="text-sm"
              value={shiftCard()?.date || ""}
              type="date"
              formHandler={formHandler}
            />
          </div>
        </Show>
      </PopupModal.Body>
      <PopupModal.Footer>
        <div class="w-full flex justify-between items-center gap-2">
          <div class="flex gap-3 justify-center items-center">
            <button
              type="button"
              onClick={onDelete}
              class="flex gap-2 justify-center items-center text-gray-500 text-sm hover:text-gray-700 tracking-wide"
            >
              <span>
                <FaSolidTrash/>
              </span>
              <span>Delete</span>
            </button>
            <button
              type="button"
              onClick={[ setModalState, "edit" ]}
              class="flex gap-2 justify-center items-center text-gray-500 text-sm hover:text-gray-700 tracking-wide"
            >
              <span class="">
                <FaSolidPencil/>
              </span>
              Edit Shift
            </button>
          </div>
          <div class="flex gap-2 justify-center items-center">
            <button
              type="button"
              onClick={onCancel}
              class="flex gap-2 justify-center items-center px-3 text-gray-500 text-sm hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={[ submit, true ]}
              class="py-1.5 px-3 font-semibold text-gray-600 border border-gray-300 text-sm rounded hover:text-black"
            >
              Save & Publish
            </button>
            <button
              type="button"
              onClick={[ submit, false ]}
              class="py-1.5 px-3 font-semibold text-white border border-blue-600 bg-blue-500 text-sm rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </PopupModal.Footer>
    </>
  );
};

export default Copy;
