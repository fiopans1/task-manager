import { useCallback, useState } from "react";

const INITIAL_STATE = {
  open: false,
  mode: "create",
  data: null,
};

/**
 * State for a single create/edit dialog.
 *
 * Keeping this in a hook means collection pages no longer duplicate three
 * pieces of state per entity (open, mode, initial data).
 */
export function useEntityDialog() {
  const [state, setState] = useState(INITIAL_STATE);

  const openCreate = useCallback(() => {
    setState({ open: true, mode: "create", data: null });
  }, []);

  const openEdit = useCallback((data) => {
    setState({ open: true, mode: "edit", data });
  }, []);

  const close = useCallback(() => {
    setState((current) => ({ ...current, open: false }));
  }, []);

  const setOpen = useCallback((open) => {
    setState((current) => ({ ...current, open }));
  }, []);

  return {
    ...state,
    isEdit: state.mode === "edit",
    openCreate,
    openEdit,
    close,
    setOpen,
  };
}
