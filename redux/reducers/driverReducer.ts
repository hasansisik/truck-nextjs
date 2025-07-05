import { createReducer } from "@reduxjs/toolkit";
import {
  getAllDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  clearDriverError
} from "../actions/driverActions";

export interface Driver {
  _id: string;
  name: string;
  phone: string;
  license: string;
  experience: number;
  avatar?: string;
  status?: string;
}

interface DriverState {
  drivers: Driver[];
  currentDriver: Driver | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: DriverState = {
  drivers: [],
  currentDriver: null,
  loading: false,
  error: null,
  success: false,
};

export const driverReducer = createReducer(initialState, (builder) => {
  builder
    // Clear error action
    .addCase(clearDriverError, (state) => {
      state.error = null;
    })
    
    // Get All Drivers
    .addCase(getAllDrivers.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getAllDrivers.fulfilled, (state, action) => {
      state.loading = false;
      state.drivers = action.payload;
      state.error = null;
    })
    .addCase(getAllDrivers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    
    // Get Single Driver
    .addCase(getDriver.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getDriver.fulfilled, (state, action) => {
      state.loading = false;
      state.currentDriver = action.payload;
      state.error = null;
    })
    .addCase(getDriver.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    
    // Create Driver
    .addCase(createDriver.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(createDriver.fulfilled, (state, action) => {
      state.loading = false;
      state.drivers = [...state.drivers, action.payload];
      state.success = true;
      state.error = null;
    })
    .addCase(createDriver.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })
    
    // Update Driver
    .addCase(updateDriver.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(updateDriver.fulfilled, (state, action) => {
      state.loading = false;
      state.drivers = state.drivers.map(driver => 
        driver._id === action.payload._id ? action.payload : driver
      );
      state.currentDriver = action.payload;
      state.success = true;
      state.error = null;
    })
    .addCase(updateDriver.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })
    
    // Delete Driver
    .addCase(deleteDriver.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(deleteDriver.fulfilled, (state, action) => {
      state.loading = false;
      state.drivers = state.drivers.filter(driver => driver._id !== action.payload);
      state.success = true;
      state.error = null;
    })
    .addCase(deleteDriver.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    });
}); 