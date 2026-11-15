import { useEffect, useState } from "react";
import authService from "@/services/authService";
import profileService from "@/services/profileService";
import { errorToast, successToast } from "@/shared/feedback/Noty";

const EMPTY_FORM = {
  name: "",
  surname1: "",
  surname2: "",
  username: "",
  email: "",
};

export function useProfile() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);

  useEffect(() => {
    let active = true;

    profileService
      .getProfile()
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setForm({
          name: data.name || "",
          surname1: data.surname1 || "",
          surname2: data.surname2 || "",
          username: data.username || "",
          email: data.email || "",
        });
      })
      .catch((error) => {
        if (!active) return;
        const message =
          error.response?.data?.message || "Could not load your profile";
        setLoadError(message);
        errorToast(message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const session = await profileService.updateProfile(form);
      authService.updateSession(session);
      setProfile((current) => ({
        ...current,
        username: session.user?.username || form.username,
        email: session.user?.email || form.email,
        displayName: session.user?.displayName || current?.displayName,
        name: form.name,
        surname1: form.surname1,
        surname2: form.surname2,
      }));
      successToast("Profile updated successfully");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Could not update your profile";
      errorToast(message);
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    profile,
    loading,
    saving,
    loadError,
    passwordOpen,
    setPasswordOpen,
    handleChange,
    submit,
    canChangeEmail: profile?.canChangeEmail !== false,
    canChangePassword: profile?.canChangePassword === true,
  };
}
