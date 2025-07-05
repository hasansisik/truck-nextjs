import axios from "axios";
import { createAsyncThunk, createAction } from "@reduxjs/toolkit";
import { server } from "@/config";
import { safeLocalStorage, handleApiError, showSuccess, showPermissionDenied } from "@/lib/utils";
import { Vehicle } from "../reducers/vehicleReducer";

// Clear error action
export const clearVehicleError = createAction('vehicle/clearError');

export interface VehiclePayload {
  name: string;
  model: string;
  year: number | string;
  licensePlate: string;
  plateNumber?: string;
  status?: string;
  image?: string;
}

export interface UpdateVehiclePayload extends Partial<VehiclePayload> {
  id: string;
}

// Get all vehicles
export const getAllVehicles = createAsyncThunk(
  "vehicle/getAllVehicles",
  async (_, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/vehicles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.vehicles;
    } catch (error: any) {
      const message = handleApiError(error, 'Araçlar alınamadı', false);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get a single vehicle
export const getVehicle = createAsyncThunk(
  "vehicle/getVehicle",
  async (id: string, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/vehicles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.vehicle;
    } catch (error: any) {
      const message = handleApiError(error, 'Araç bilgileri alınamadı', false);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a vehicle
export const createVehicle = createAsyncThunk(
  "vehicle/createVehicle",
  async (payload: VehiclePayload, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      // Ensure year is a number
      const processedPayload = {
        ...payload,
        year: typeof payload.year === 'string' ? parseInt(payload.year) || new Date().getFullYear() : payload.year,
        // Ensure plateNumber is set for backward compatibility
        plateNumber: payload.licensePlate
      };
      
      console.log("Creating vehicle with payload:", processedPayload);
      const { data } = await axios.post(`${server}/vehicles`, processedPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Araç başarıyla oluşturuldu");
      return data.vehicle;
    } catch (error: any) {
      console.error("Vehicle creation error details:", error.response?.data || error.message);
      const message = handleApiError(error, 'Araç oluşturulamadı', true);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a vehicle
export const updateVehicle = createAsyncThunk(
  "vehicle/updateVehicle",
  async (payload: UpdateVehiclePayload, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { id, ...vehicleData } = payload;
      
      // Ensure year is a number if it exists
      const processedVehicleData = {
        ...vehicleData,
        year: vehicleData.year !== undefined 
          ? (typeof vehicleData.year === 'string' 
              ? parseInt(vehicleData.year) || new Date().getFullYear() 
              : vehicleData.year)
          : undefined,
        // Ensure plateNumber is set if licensePlate exists
        plateNumber: vehicleData.licensePlate || undefined
      };
      
      const { data } = await axios.put(`${server}/vehicles/${id}`, processedVehicleData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Araç başarıyla güncellendi");
      return data.vehicle;
    } catch (error: any) {
      // Check for permission error
      if (error?.response?.status === 403) {
        showPermissionDenied();
      } else {
        handleApiError(error, 'Araç güncellenemedi', true);
      }
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Araç güncellenemedi');
    }
  }
);

// Delete a vehicle
export const deleteVehicle = createAsyncThunk(
  "vehicle/deleteVehicle",
  async (id: string, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      await axios.delete(`${server}/vehicles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Araç başarıyla silindi");
      return id;
    } catch (error: any) {
      // Check for permission error
      if (error?.response?.status === 403) {
        showPermissionDenied();
      } else {
        handleApiError(error, 'Araç silinemedi', true);
      }
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Araç silinemedi');
    }
  }
); 