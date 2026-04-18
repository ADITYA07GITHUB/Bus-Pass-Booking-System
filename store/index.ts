// store/index.ts - Redux store configuration

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import passReducer from "./slices/passSlice";
import routeReducer from "./slices/routeSlice";
import adminReducer from "./slices/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    passes: passReducer,
    routes: routeReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
