import { BsCheckCircle, BsExclamationCircle } from "solid-icons/bs";
import { FaSolidPencil, FaSolidTrash } from "solid-icons/fa";
import { Accessor, Component, For, Setter, Show } from "solid-js";
import PopupModal from "~/components/PopupModal";
import { Role } from "~/types";
import { Tabs } from ".";
import { shiftDetailsTime } from "../utils/shiftTimes";
import { ShiftCard } from "~/context/ShiftPlanning";
import { TbSpeakerphone } from "solid-icons/tb";
import { useAuth } from "~/context/Auth";

interface ErrorsProps {
  shiftCard: Accessor<ShiftCard | undefined>;
  setModalState: Setter<Tabs>;
  onDelete: () => void;
  openCreateCoverModal: () => void;
}

const Errors: Component<ErrorsProps> = ({ shiftCard, setModalState, onDelete, openCreateCoverModal }) => {
  // console.log("shiftCard", shiftCard()?.rules);
  const { user } = useAuth();

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
                "bg-gray-400":
                  shiftCard()?.role === Role.ALL_ROLES,
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
            Ignore Shift Error Rules
          </label>
          <p class="text-gray-400 text-sm tracking-wide">
            The table below is a breakdown of your error rules for this shift.
            If a rule triggers a flag, this shift can still be saved, but it
            will show as having an error.
          </p>
        </div>
        <div class="mb-4 text-sm tracking-wider">
          {/* Header */}
          <div class="bg-[#f8fafc]">
            <div class="flex border-t border-gray-200">
              <div class="text-gray-700 font-semibold p-2 flex-1">Rule</div>
              <div class="text-gray-700 font-semibold p-2 w-[120px] text-center border-l border-dashed border-gray-200">
                Status
              </div>
            </div>
          </div>

          {/* Body */}
          <div>
            <For each={shiftCard()!.rules}>
              {(rule) => (
                <div class="flex border-t border-gray-200">
                  <div class="text-[#637286] p-2 flex-1">
                    {rule.description}
                  </div>
                  <div
                    class="font-semibold p-2 w-[120px] text-center border-l border-dashed border-gray-200 flex justify-center items-center gap-1"
                    classList={{
                      "text-[#00bc1d]": rule.passed,
                      "text-[#F6993F]": !rule.passed,
                    }}
                  >
                    <Show when={!rule.passed} fallback={<BsCheckCircle/>}>
                      <span>
                        <BsExclamationCircle/>
                      </span>
                    </Show>
                    <span>{rule.passed ? "Passed" : "Flagged"}</span>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </PopupModal.Body>
      <PopupModal.Footer>
        <div class="w-full flex justify-start items-center gap-3">
          <Show when={user()?.role === Role.ADMIN}>
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
          </Show>
          {/*<Show when={!shiftCard()?.shiftCoverRequest && shiftCard()?.staff === null}>*/}
            <button
              type="button"
              onClick={openCreateCoverModal}
              class="flex gap-2 justify-center items-center text-gray-500 text-sm hover:text-gray-700 tracking-wide"
            >
            <span class="text-base font-bold">
              <TbSpeakerphone/>
            </span>
              New Shift Cover
            </button>
          {/*</Show>*/}
        </div>
      </PopupModal.Footer>
    </>
  );
};

export default Errors;
