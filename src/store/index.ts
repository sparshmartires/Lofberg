import { configureStore } from "@reduxjs/toolkit";
import { exampleApi } from "./services/exampleApi";


export const store = configureStore({
  reducer: {
    [exampleApi.reducerPath]: exampleApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(exampleApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
