import { toast } from "sonner";

const DEFAULT_DURATION = 3000;
const ERROR_DURATION = 5000;

export function successToast(message, opts = {}) {
    toast.success(message, { duration: DEFAULT_DURATION, ...opts });
}

export function errorToast(message, opts = {}) {
    toast.error(message, { duration: ERROR_DURATION, ...opts });
}

export function warningToast(message, opts = {}) {
    toast.warning(message, { duration: DEFAULT_DURATION, ...opts });
}

export function infoToast(message, opts = {}) {
    toast.info(message, { duration: DEFAULT_DURATION, ...opts });
}

export function promiseToast(promise, { loading, success, error, ...rest } = {}) {
    const result = toast.promise(promise, {
        loading: loading ?? "Loading...",
        success,
        error:
            typeof error === "function"
                ? error
                : (err) => error ?? err?.message ?? "Error",
        ...rest,
    });
    if (result && typeof result.unwrap === "function") {
        return result.unwrap();
    }
    return result;
}
