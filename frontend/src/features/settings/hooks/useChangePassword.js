import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "@/services/authService";
import profileService from "@/services/profileService";
import { errorToast, successToast } from "@/shared/feedback/Noty";

const EMPTY_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function useChangePassword({ open, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setSubmitting(false);
    }
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      errorToast("Passwords do not match");
      return;
    }

    if (form.newPassword === form.currentPassword) {
      errorToast("New password must be different from the current password");
      return;
    }

    setSubmitting(true);
    try {
      await profileService.changePassword(form.currentPassword, form.newPassword);
      successToast("Password changed. Please sign in again.");
      authService.clearLocalSession();
      onClose();
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Could not change password";
      errorToast(message);
      setSubmitting(false);
    }
  };

  return { form, submitting, handleChange, submit };
}
