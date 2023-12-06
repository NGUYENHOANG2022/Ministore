import toast, { Toast } from "solid-toast";
import DeleteConfirmation from "~/components/DeleteConfirmation";
import { JSX } from "solid-js";

export function toastError(message: string) {
  toast.error(message, {
    duration: 2000,
    style: {
      color: "#dc2626",
      background: "#fecaca",
      border: "1px solid #b91c1c",
    },
  });
}

export function toastSuccess(message: string) {
  toast.success(message, {
    duration: 2000,
    style: {
      color: "#26dc35",
      background: "#ccfeca",
      border: "1px solid #26dc35",
    },
  });
}

export function toastWarning(message: string) {
  toast.error(message, {
    duration: 2000,
    style: {
      color: "#ff8800",
      background: "#fefdca",
      border: "1px solid #dcd926",
    },
  });
}

export function toastConfirmDeletion(message: string | JSX.Element, onConfirm: (t:Toast) => void) {
  toast.custom((t:Toast) => DeleteConfirmation({t, onConfirm, message}), {duration: Infinity} )
}
