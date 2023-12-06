import { Accessor, Component, For, Setter, Show } from "solid-js";
import PopupModal from "~/components/PopupModal";
import { Shift } from "~/types";
import ShiftCard from "~/components/attendance/ShiftCard";

const ShiftsChooserModal: Component<{
  showModal: Accessor<boolean>;
  setShowModal: Setter<boolean>;
  setChosenShiftId: (shiftId: number) => void;
  shifts: () => Shift[];
}> = ({ showModal, setShowModal, setChosenShiftId, shifts }) => {

  return (
    <PopupModal.Wrapper title="Choose a shift" close={() => setShowModal(false)} open={showModal}>
      <Show when={shifts().length > 0} fallback={<p class="text-center my-5 text-gray-500">No shift available</p>}>
        <PopupModal.Body>
          <For each={shifts()}>
            {(shift) => (<ShiftCard shift={shift} onClick={() => setChosenShiftId(shift.shiftId)}/>)}
          </For>
        </PopupModal.Body>
      </Show>
    </PopupModal.Wrapper>

  )
}

export default ShiftsChooserModal;