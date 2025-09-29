import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;

      // También almacenamos el token en localStorage para persistencia
      localStorage.setItem("auth_token", action.payload);
    },
    clearToken: (state) => {
      state.token = null;

      // También eliminamos el token de localStorage
      localStorage.removeItem("auth_token");
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
