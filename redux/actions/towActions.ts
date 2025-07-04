import axios from "axios";
import { createAsyncThunk, createAction } from "@reduxjs/toolkit";
import { server } from "@/config";

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
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/tows`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.tows;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Çekme kayıtları alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get a single tow
export const getTow = createAsyncThunk(
  "tow/getTow",
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/tows/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.tow;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Çekme kaydı alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a tow
export const createTow = createAsyncThunk(
  "tow/createTow",
  async (payload: TowPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.post(`${server}/tows`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.tow;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Çekme kaydı oluşturulamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a tow
export const updateTow = createAsyncThunk(
  "tow/updateTow",
  async (payload: UpdateTowPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { id, ...towData } = payload;
      const { data } = await axios.put(`${server}/tows/${id}`, towData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.tow;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Çekme kaydı güncellenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a tow
export const deleteTow = createAsyncThunk(
  "tow/deleteTow",
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${server}/tows/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Çekme kaydı silinemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
); 