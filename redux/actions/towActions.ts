import axios from "axios";
import { createAsyncThunk, createAction } from "@reduxjs/toolkit";
import { server } from "@/config";
import { handleApiError, showSuccess, safeLocalStorage, showPermissionDenied } from "@/lib/utils";

// Clear error action
export const clearTowError = createAction('tow/clearError');

export interface TowPayload {
  towTruck: string;
  driver: string;
  licensePlate: string;
  towDate: string;
  distance: number;
  company: string;
  images: string[];
}

export interface UpdateTowPayload extends Partial<TowPayload> {
  id: string;
}

// Get all tows
export const getAllTows = createAsyncThunk(
  "tow/getAllTows",
  async (_, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/tow`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.tows;
    } catch (error: any) {
      const message = handleApiError(error, 'Çekme kayıtları alınamadı', false);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get a single tow
export const getTow = createAsyncThunk(
  "tow/getTow",
  async (id: string, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/tow/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.tow;
    } catch (error: any) {
      const message = handleApiError(error, 'Çekme kaydı alınamadı', false);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a tow
export const createTow = createAsyncThunk(
  "tow/createTow",
  async (payload: TowPayload, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.post(`${server}/tow`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Çekme kaydı başarıyla oluşturuldu");
      return data.tow;
    } catch (error: any) {
      const message = handleApiError(error, 'Çekme kaydı oluşturulamadı', true);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a tow
export const updateTow = createAsyncThunk(
  "tow/updateTow",
  async (payload: UpdateTowPayload, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { id, ...towData } = payload;
      const { data } = await axios.put(`${server}/tow/${id}`, towData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Çekme kaydı başarıyla güncellendi");
      return data.tow;
    } catch (error: any) {
      // Check for permission error
      if (error?.response?.status === 403) {
        showPermissionDenied();
      } else {
        handleApiError(error, 'Çekme kaydı güncellenemedi', true);
      }
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Çekme kaydı güncellenemedi');
    }
  }
);

// Delete a tow
export const deleteTow = createAsyncThunk(
  "tow/deleteTow",
  async (id: string, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      await axios.delete(`${server}/tow/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Çekme kaydı başarıyla silindi");
      return id;
    } catch (error: any) {
      // Check for permission error
      if (error?.response?.status === 403) {
        showPermissionDenied();
      } else {
        handleApiError(error, 'Çekme kaydı silinemedi', true);
      }
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Çekme kaydı silinemedi');
    }
  }
); 