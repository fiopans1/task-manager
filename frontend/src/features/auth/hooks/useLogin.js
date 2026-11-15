import { useState } from "react";
import authService from "@/services/authService";
import { successToast } from "@/shared/feedback/Noty";

function loginErrorMessage(error) {
  const status = error?.response?.status;
  const serverMessage =
    error?.response?.data?.error || error?.response?.data?.message || "";

  if (/blocked/i.test(String(serverMessage))) {
    return "This account is blocked. Contact an administrator if you think this is a mistake.";
  }
  if (status === 401 || status === 400) {
    return "We couldn't sign you in. Check your username and password and try again.";
  }
  if (status === 429) {
    return "Too many attempts. Wait a moment and try again.";
  }
  if (status === 403) {
    return "This account is blocked. Contact an administrator if you think this is a mistake.";
  }
  if (!error?.response) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  return "Sign-in is unavailable right now. Try again in a moment.";
}

export function useLogin(onLogin) {
  const [username, setUsernameValue] = useState("");
  const [password, setPasswordValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setUsername = (value) => {
    setUsernameValue(value);
    if (error) setError(null);
  };

  const setPassword = (value) => {
    setPasswordValue(value);
    if (error) setError(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError("Enter your username and password to continue.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.login(username, password);
      successToast("Logged in");
      onLogin();
    } catch (requestError) {
      setError(loginErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    error,
    submit,
  };
}
