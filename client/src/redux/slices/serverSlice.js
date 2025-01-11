// serverSlice.js
import { createSlice } from "@reduxjs/toolkit";

const serverSlice = createSlice({
  name: "server",
  initialState: {
    serverUrl: "http://localhost:8080",
  },
  reducers: {
    setServerUrl: (state, action) => {
      state.serverUrl = action.payload;
    },
  },
});

export const { setServerUrl } = serverSlice.actions;
export default serverSlice.reducer;
