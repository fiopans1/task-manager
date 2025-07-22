import { toast } from "react-toastify";

export function successToast(message) {
  toast.success(message, { closeOnClick: true });
}

export function errorToast(message) {
  toast.error(message, { closeOnClick: true, autoClose: 5000 });
}

export function warningToast(message) {
  toast.warning(message, { closeOnClick: true });
}

export function infoToast(message) {
  toast.info(message, { closeOnClick: true });
}
