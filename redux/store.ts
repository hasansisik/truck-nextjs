// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userReducer";
import towReducer from "./reducers/towReducer";
import { vehicleReducer } from './reducers/vehicleReducer';
import { driverReducer } from './reducers/driverReducer';
import { companyReducer } from './reducers/companyReducer';
import { expenseReducer } from './reducers/expenseReducer';

export const store = configureStore({
  reducer: {
    user: userReducer,
    tow: towReducer,
    vehicle: vehicleReducer,
    driver: driverReducer,
    company: companyReducer,
    expense: expenseReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;