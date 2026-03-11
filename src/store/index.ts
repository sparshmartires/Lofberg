import { configureStore } from "@reduxjs/toolkit";
import { exampleApi } from "./services/exampleApi";
import { authApi } from "./services/authApi";
import { usersApi } from "./services/usersApi";
import { salesRepresentativesApi } from "./services/salesRepresentativesApi";
import { customersApi } from "./services/customersApi";
import authReducer from "./slices/authSlice";


export const store = configureStore({
  reducer: {
    [exampleApi.reducerPath]: exampleApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [salesRepresentativesApi.reducerPath]: salesRepresentativesApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      exampleApi.middleware,
      authApi.middleware,
      usersApi.middleware,
      salesRepresentativesApi.middleware,
      customersApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
