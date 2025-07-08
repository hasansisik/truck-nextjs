import axios from "axios";
import { createAsyncThunk, createAction } from "@reduxjs/toolkit";
import { server } from "@/config";
import { handleApiError, showSuccess, safeLocalStorage, showPermissionDenied } from "@/lib/utils";

// Clear error action
export const clearExpenseError = createAction('expense/clearError');

export interface ExpensePayload {
  name: string;
  description: string;
  date: string;
  amount: number;
}

export interface UpdateExpensePayload extends Partial<ExpensePayload> {
  id: string;
}

// Get all expenses
export const getAllExpenses = createAsyncThunk(
  "expense/getAllExpenses",
  async (_, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.expenses;
    } catch (error: any) {
      const message = handleApiError(error, 'Masraf kayıtları alınamadı', false);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get a single expense
export const getExpense = createAsyncThunk(
  "expense/getExpense",
  async (id: string, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.expense;
    } catch (error: any) {
      const message = handleApiError(error, 'Masraf kaydı alınamadı', false);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create an expense
export const createExpense = createAsyncThunk(
  "expense/createExpense",
  async (payload: ExpensePayload, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.post(`${server}/expenses`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Masraf kaydı başarıyla oluşturuldu");
      return data.expense;
    } catch (error: any) {
      const message = handleApiError(error, 'Masraf kaydı oluşturulamadı', true);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update an expense
export const updateExpense = createAsyncThunk(
  "expense/updateExpense",
  async (payload: UpdateExpensePayload, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { id, ...expenseData } = payload;
      const { data } = await axios.put(`${server}/expenses/${id}`, expenseData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Masraf kaydı başarıyla güncellendi");
      return data.expense;
    } catch (error: any) {
      // Check for permission error
      if (error?.response?.status === 403) {
        showPermissionDenied();
      } else {
        handleApiError(error, 'Masraf kaydı güncellenemedi', true);
      }
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Masraf kaydı güncellenemedi');
    }
  }
);

// Delete an expense
export const deleteExpense = createAsyncThunk(
  "expense/deleteExpense",
  async (id: string, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      await axios.delete(`${server}/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Masraf kaydı başarıyla silindi");
      return id;
    } catch (error: any) {
      // Check for permission error
      if (error?.response?.status === 403) {
        showPermissionDenied();
      } else {
        handleApiError(error, 'Masraf kaydı silinemedi', true);
      }
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Masraf kaydı silinemedi');
    }
  }
); 