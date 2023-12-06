import { Accessor, Component, Setter } from "solid-js";
import PopupModal from "../PopupModal";

const CreateModalFallback: Component<{
  showModal: Accessor<boolean>;
  setShowModal: Setter<boolean>;
}> = ({ setShowModal, showModal }) => {
  return (
    <PopupModal.Wrapper title="New Shift Cover Request" close={() => setShowModal(false)} open={showModal}>
      <PopupModal.Body>
        <div class="flex flex-col items-center justify-center gap-2 h-[300px]">
          <div class="text-lg font-semibold text-gray-700">
            You must select a shift to create a shift cover request!
          </div>
          <p class="text-gray-400 text-sm tracking-wide">
            Go ahead, click on any shift to get started with your request.
          </p>
        </div>
      </PopupModal.Body>
    </PopupModal.Wrapper>
  )
}
export default CreateModalFallback;