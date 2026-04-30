import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  username: null,
  email: null,
  roles: [],
  expiresAt: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action) => {
      state.isAuthenticated = true;
      state.username = action.payload.username ?? null;
      state.email = action.payload.email ?? null;
      state.roles = action.payload.roles ?? [];
      state.expiresAt = action.payload.expiresAt ?? null;
    },
    clearSession: (state) => {
      state.isAuthenticated = false;
      state.username = null;
      state.email = null;
      state.roles = [];
      state.expiresAt = null;
    },
  },
});

export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
