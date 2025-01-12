// store.js
import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";
import serverReducer from "./slices/serverSlice";
import authReducer from "./slices/authSlice";
const persistConfig = {
  key: "root",
  storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);
const persistedServerReducer = persistReducer(persistConfig, serverReducer);
const store = configureStore({
  reducer: {
    server: persistedServerReducer,
    auth: persistedAuthReducer,
  },
});

export const persistor = persistStore(store); // Creamos el persistor
export default store;
