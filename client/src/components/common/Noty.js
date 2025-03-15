import { toast } from "react-toastify"


export function successToast(message){
  toast.success(message);
}

export function errorToast(message){
  toast.error(message, {autoClose: 5000});
}

export function warningToast(message){
  toast.warning(message);
}

export function infoToast(message){
  toast.info(message);
}
