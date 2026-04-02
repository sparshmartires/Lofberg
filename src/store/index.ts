import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./services/authApi";
import { usersApi } from "./services/usersApi";
import { customersApi } from "./services/customersApi";
import { templatesApi } from "./services/templatesApi";
import { reportsApi } from "./services/reportsApi";
import { conversionLogicApi } from "./services/conversionLogicApi";
import { resourcesApi } from "./services/resourcesApi";
import { dashboardApi } from "./services/dashboardApi";
import authReducer from "./slices/authSlice";
import reportWizardReducer from "./slices/reportWizardSlice";


export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    [templatesApi.reducerPath]: templatesApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
    [conversionLogicApi.reducerPath]: conversionLogicApi.reducer,
    [resourcesApi.reducerPath]: resourcesApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    auth: authReducer,
    reportWizard: reportWizardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      usersApi.middleware,
      customersApi.middleware,
      templatesApi.middleware,
      reportsApi.middleware,
      conversionLogicApi.middleware,
      resourcesApi.middleware,
      dashboardApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
