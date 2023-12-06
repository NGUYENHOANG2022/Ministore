import { CgClose } from "solid-icons/cg";
import { FiInfo } from "solid-icons/fi";
import { Component, JSX } from "solid-js";
import toast, { Toast } from "solid-toast";

interface DeleteConfirmationProps {
  t: Toast;
  onConfirm: (t: Toast) => void;
  message: string | JSX.Element;
}

const DeleteConfirmation: Component<DeleteConfirmationProps> = ({ t, onConfirm, message }) => {
  return (
    <div
      class={`${
        t.visible ? "animate-enter" : "animate-leave"
      } relative max-w-sm w-[400px] bg-red-50 shadow-lg rounded-md pointer-events-auto border border-red-300 overflow-hidden`}
    >
      <div class="p-2">
        <div class="flex items-start">
          <div class="flex-shrink-0 pt-[2px] text-red-600 text-2xl">
            <FiInfo/>
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            {message}
            <div class="mt-2 flex space-x-7">
              <button
                type="button"
                onClick={[ onConfirm, t ]}
                class="text-sm font-medium text-blue-500 hover:text-blue-600"
              >
                Confirm
              </button>
              <button
                type="button"
                class="text-sm font-medium text-gray-700 hover:text-gray-500"
                onClick={() => toast.dismiss(t.id)}
              >
                Dismiss
              </button>
            </div>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              class="text-xl inline-flex text-gray-400 hover:text-gray-500"
              onClick={() => toast.dismiss(t.id)}
            >
              <span class="sr-only">Close</span>
              <CgClose/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DeleteConfirmation;
