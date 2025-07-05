import { createReducer } from "@reduxjs/toolkit";
import {
  getAllVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  clearVehicleError
} from "../actions/vehicleActions";

export interface Vehicle {
  _id: string;
  name: string;
  model: string;
  year: number;
  licensePlate: string;
  status?: string;
  image?: string;
}

interface VehicleState {
  vehicles: Vehicle[];
  currentVehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: VehicleState = {
  vehicles: [],
  currentVehicle: null,
  loading: false,
  error: null,
  success: false,
};

export const vehicleReducer = createReducer(initialState, (builder) => {
  builder
    // Clear error action
    .addCase(clearVehicleError, (state) => {
      state.error = null;
    })
    
    // Get All Vehicles
    .addCase(getAllVehicles.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getAllVehicles.fulfilled, (state, action) => {
      state.loading = false;
      state.vehicles = action.payload;
      state.error = null;
    })
    .addCase(getAllVehicles.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    
    // Get Single Vehicle
    .addCase(getVehicle.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getVehicle.fulfilled, (state, action) => {
      state.loading = false;
      state.currentVehicle = action.payload;
      state.error = null;
    })
    .addCase(getVehicle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    
    // Create Vehicle
    .addCase(createVehicle.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(createVehicle.fulfilled, (state, action) => {
      state.loading = false;
      state.vehicles = [...state.vehicles, action.payload];
      state.success = true;
      state.error = null;
    })
    .addCase(createVehicle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })
    
    // Update Vehicle
    .addCase(updateVehicle.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(updateVehicle.fulfilled, (state, action) => {
      state.loading = false;
      state.vehicles = state.vehicles.map(vehicle => 
        vehicle._id === action.payload._id ? action.payload : vehicle
      );
      state.currentVehicle = action.payload;
      state.success = true;
      state.error = null;
    })
    .addCase(updateVehicle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })
    
    // Delete Vehicle
    .addCase(deleteVehicle.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(deleteVehicle.fulfilled, (state, action) => {
      state.loading = false;
      state.vehicles = state.vehicles.filter(vehicle => vehicle._id !== action.payload);
      state.success = true;
      state.error = null;
    })
    .addCase(deleteVehicle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    });
}); 