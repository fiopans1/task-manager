// store.js
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import serverReducer from "./slices/serverSlice";
import authReducer from "./slices/authSlice";
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "server"], // Solo persistimos los reducers auth y server
};
const rootReducer = combineReducers({
  // Combinamos los reducers
  auth: authReducer,
  server: serverReducer,
});
const persistedRootReducer = persistReducer(persistConfig, rootReducer); //Persistimos el reducer root
const store = configureStore({
  reducer: persistedRootReducer, // Configuramos el store
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store); // Creamos el persistor
export default store;
