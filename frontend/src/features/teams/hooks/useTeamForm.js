import { useEffect, useState } from "react";
import teamService from "@/services/teamService";
import { errorToast, promiseToast } from "@/shared/feedback/Noty";

const EMPTY_FORM = { name: "", description: "" };

export function useTeamForm({ open, mode, initialData, onSaved, onSave }) {
  const isEdit = mode === "edit";
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (isEdit && initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
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
    if (!formData.name.trim()) return false;

    setSubmitting(true);
    try {
      if (onSave) {
        await promiseToast(Promise.resolve(onSave(formData)), {
          loading: isEdit ? "Updating team..." : "Creating team...",
          success: isEdit ? "Team updated successfully" : "Team created successfully",
          error: (requestError) =>
            `Error: ${requestError?.response?.data?.message || requestError?.message || requestError}`,
        });
      } else if (isEdit) {
        await promiseToast(teamService.updateTeam(initialData.id, formData), {
          loading: "Updating team...",
          success: "Team updated successfully",
          error: (requestError) =>
            `Error: ${requestError?.response?.data?.message || requestError?.message || requestError}`,
        });
      } else {
        await promiseToast(teamService.createTeam(formData), {
          loading: "Creating team...",
          success: "Team created successfully",
          error: (requestError) =>
            `Error: ${requestError?.response?.data?.message || requestError?.message || requestError}`,
        });
      }

      setValidated(false);
      onSaved?.();
      return true;
    } catch (error) {
      errorToast(
        `Error: ${error?.response?.data?.message || error.message || error}`,
      );
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
