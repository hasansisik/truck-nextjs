import axios from "axios";
import { createAsyncThunk, createAction } from "@reduxjs/toolkit";
import { server } from "@/config";
import { safeLocalStorage, handleApiError, showSuccess, showPermissionDenied } from "@/lib/utils";
import { Driver } from "../reducers/driverReducer";

// Clear error action
export const clearDriverError = createAction('driver/clearError');

export interface DriverPayload {
  name: string;
  phone: string;
  license: string;
  experience: number | string;
  avatar?: string;
  status?: string;
}

export interface UpdateDriverPayload extends Partial<DriverPayload> {
  id: string;
}

// Get all drivers
export const getAllDrivers = createAsyncThunk(
  "driver/getAllDrivers",
  async (_, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/drivers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.drivers;
    } catch (error: any) {
      const message = handleApiError(error, 'Şoförler alınamadı', false);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get a single driver
export const getDriver = createAsyncThunk(
  "driver/getDriver",
  async (id: string, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/drivers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.driver;
    } catch (error: any) {
      const message = handleApiError(error, 'Şoför bilgileri alınamadı', false);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a driver
export const createDriver = createAsyncThunk(
  "driver/createDriver",
  async (payload: DriverPayload, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      // Format phone number and ensure experience is a number
      const processedPayload = {
        ...payload,
        // Format phone - keep only digits, plus sign, and ensure proper format
        phone: payload.phone.trim(),
        experience: typeof payload.experience === 'string' ? parseInt(payload.experience) || 0 : payload.experience
      };
      
      console.log("Creating driver with payload:", processedPayload);
      const { data } = await axios.post(`${server}/drivers`, processedPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Şoför başarıyla oluşturuldu");
      return data.driver;
    } catch (error: any) {
      console.error("Driver creation error details:", error.response?.data || error.message);
      const message = handleApiError(error, 'Şoför oluşturulamadı', true);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a driver
export const updateDriver = createAsyncThunk(
  "driver/updateDriver",
  async (payload: UpdateDriverPayload, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { id, ...driverData } = payload;
      
      // Format data for update
      const processedDriverData = {
        ...driverData,
        // Format phone if it exists
        phone: driverData.phone ? driverData.phone.trim() : undefined,
        experience: driverData.experience !== undefined 
          ? (typeof driverData.experience === 'string' 
              ? parseInt(driverData.experience) || 0 
              : driverData.experience)
          : undefined
      };
      
      const { data } = await axios.put(`${server}/drivers/${id}`, processedDriverData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Şoför başarıyla güncellendi");
      return data.driver;
    } catch (error: any) {
      // Check for permission error
      if (error?.response?.status === 403) {
        showPermissionDenied();
      } else {
        handleApiError(error, 'Şoför güncellenemedi', true);
      }
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Şoför güncellenemedi');
    }
  }
);

// Delete a driver
export const deleteDriver = createAsyncThunk(
  "driver/deleteDriver",
  async (id: string, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      await axios.delete(`${server}/drivers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Şoför başarıyla silindi");
      return id;
    } catch (error: any) {
      // Check for permission error
      if (error?.response?.status === 403) {
        showPermissionDenied();
      } else {
        handleApiError(error, 'Şoför silinemedi', true);
      }
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Şoför silinemedi');
    }
  }
); 