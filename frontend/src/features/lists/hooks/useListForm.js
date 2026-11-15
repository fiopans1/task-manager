import { useEffect, useState } from "react";
import listService from "@/services/listService";
import { errorToast, promiseToast } from "@/shared/feedback/Noty";

const EMPTY_FORM = {
  id: null,
  nameOfList: "",
  descriptionOfList: "",
  color: "#2457F5",
};

export function useListForm({ open, mode, initialData, onSaved, onSave }) {
  const isEdit = mode === "edit";
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (isEdit && initialData) {
      setFormData({
        id: initialData.id || null,
        nameOfList: initialData.nameOfList || "",
        descriptionOfList: initialData.descriptionOfList || "",
        color: initialData.color || "#2457F5",
      });
    } else {
      setFormData(EMPTY_FORM);
    }

    setValidated(false);
  }, [open, isEdit, initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const submit = async () => {
    setValidated(true);

    if (!formData.nameOfList?.trim() || !formData.color?.trim()) {
      return false;
    }

    setSubmitting(true);
    try {
      if (onSave) {
        await promiseToast(Promise.resolve(onSave(formData)), {
          loading: "Saving list...",
          success: "List updated successfully",
          error: (requestError) => `Error: ${requestError?.message || requestError}`,
        });
      } else if (isEdit && formData.id) {
        await promiseToast(listService.updateList(formData), {
          loading: "Updating list...",
          success: "List updated successfully",
          error: (requestError) => `Error: ${requestError?.message || requestError}`,
        });
      } else {
        await promiseToast(listService.createList(formData), {
          loading: "Creating list...",
          success: "List created successfully",
          error: (requestError) => `Error: ${requestError?.message || requestError}`,
        });
      }

      setValidated(false);
      onSaved?.();
      return true;
    } catch (error) {
      errorToast(`Error: ${error.message}`);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isEdit,
    formData,
    validated,
    submitting,
    handleChange,
    submit,
  };
}
