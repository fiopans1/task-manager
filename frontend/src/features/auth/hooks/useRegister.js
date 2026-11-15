import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "@/services/authService";
import { errorToast, successToast } from "@/shared/feedback/Noty";

const EMPTY_FORM = {
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  name: "",
  surname1: "",
  surname2: "",
};

export function useRegister() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const data = await authService.register(formData);
      if (data.successCount > 0) {
        successToast(data.successMessages.join(", "));
        navigate("/login");
      }
    } catch (error) {
      errorToast(`Registration error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    loading,
    submit,
  };
}
