import axios from "axios";
import { createAsyncThunk, createAction } from "@reduxjs/toolkit";
import { server } from "@/config";
import { safeLocalStorage, handleApiError, showSuccess, showPermissionDenied } from "@/lib/utils";

// Clear error action
export const clearCompanyError = createAction('company/clearError');

export interface CompanyPayload {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  status?: string;
}

export interface UpdateCompanyPayload extends Partial<CompanyPayload> {
  id: string;
}

// Get all companies
export const getAllCompanies = createAsyncThunk(
  "company/getAllCompanies",
  async (_, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/companies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.companies;
    } catch (error: any) {
      const message = handleApiError(error, 'Firmalar alınamadı', false);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get a single company
export const getCompany = createAsyncThunk(
  "company/getCompany",
  async (id: string, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/companies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.company;
    } catch (error: any) {
      const message = handleApiError(error, 'Firma bilgileri alınamadı', false);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a company
export const createCompany = createAsyncThunk(
  "company/createCompany",
  async (payload: CompanyPayload, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.post(`${server}/companies`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Firma başarıyla oluşturuldu");
      return data.company;
    } catch (error: any) {
      const message = handleApiError(error, 'Firma oluşturulamadı', true);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a company
export const updateCompany = createAsyncThunk(
  "company/updateCompany",
  async (payload: UpdateCompanyPayload, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { id, ...companyData } = payload;
      const { data } = await axios.put(`${server}/companies/${id}`, companyData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Firma başarıyla güncellendi");
      return data.company;
    } catch (error: any) {
      // Check for permission error
      if (error?.response?.status === 403) {
        showPermissionDenied();
      } else {
        handleApiError(error, 'Firma güncellenemedi', true);
      }
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Firma güncellenemedi');
    }
  }
);

// Delete a company
export const deleteCompany = createAsyncThunk(
  "company/deleteCompany",
  async (id: string, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      await axios.delete(`${server}/companies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Firma başarıyla silindi");
      return id;
    } catch (error: any) {
      // Check for permission error
      if (error?.response?.status === 403) {
        showPermissionDenied();
      } else {
        handleApiError(error, 'Firma silinemedi', true);
      }
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Firma silinemedi');
    }
  }
); 