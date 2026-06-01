import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    user: null,
    roles: [],
    sessionId: null,
    accessExpiresAt: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setSession: (state, action) => {
            const session = action.payload;
            const isAuthenticated = Boolean(session?.authenticated);
            state.isAuthenticated = isAuthenticated;
            state.user = isAuthenticated ? session.user : null;
            state.roles = isAuthenticated ? session.roles || [] : [];
            state.sessionId = isAuthenticated ? session.sessionId : null;
            state.accessExpiresAt = isAuthenticated ? session.accessExpiresAt : null;
        },
        clearSession: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.roles = [];
            state.sessionId = null;
            state.accessExpiresAt = null;
        },
    },
});

export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
