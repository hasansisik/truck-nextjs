import axios from "axios";
import { createAsyncThunk, createAction } from "@reduxjs/toolkit";
import { server } from "@/config";

// Clear error action
export const clearError = createAction('user/clearError');

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  picture?: string;
  role?: string;
  companyId?: string;
}

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
}

export interface EditProfilePayload {
  name?: string;
  email?: string;
  picture?: string;
  companyId?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface EditUserPayload {
  userId: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  status?: string;
  picture?: string;
  companyId?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  verificationCode: string;
}

// Premium durumunu güncelleme
export const setPremiumStatus = createAsyncThunk(
  "user/setPremiumStatus",
  async (isPremium: boolean, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.post(`${server}/auth/set-premium-status`, 
        { isPremium },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Premium durum güncellenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Kullanıcı kayıt işlemi (normal kullanıcılar için)
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (payload: RegisterUserPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/register-user`, payload);
      return data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Kullanıcı kaydı yapılamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Şifremi unuttum işlemi
export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (payload: ForgotPasswordPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/forgot-password`, payload);
      return data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Şifre sıfırlama isteği gönderilemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Şifre sıfırlama işlemi
export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async (payload: ResetPasswordPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/reset-password`, payload);
      return data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Şifre sıfırlanamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Email doğrulama işlemi
export const verifyEmail = createAsyncThunk(
  "user/verifyEmail",
  async (payload: VerifyEmailPayload, thunkAPI) => {
    try {
      // Eğer verificationCode bir dizi ise birleştir
      let code = payload.verificationCode;
      
      const { data } = await axios.post(`${server}/auth/verify-email`, {
        email: payload.email,
        verificationCode: code
      });
      return data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Email doğrulanamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Doğrulama kodunu tekrar gönderme
export const resendVerificationCode = createAsyncThunk(
  "user/resendVerificationCode",
  async (email: string, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/again-email`, { email });
      return data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Doğrulama kodu gönderilemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk(
  "user/login",
  async (payload: LoginPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/login`, payload);
      const token = data.user.token;
      localStorage.setItem("accessToken", token);
      document.cookie = `token=${token}; path=/; max-age=86400`; // 24 hours
      return data.user;
    } catch (error: any) {
      let message = error.response?.data?.message || 'Giriş yapılamadı';
      
      // Convert technical error messages to user-friendly ones
      if (message === 'Unauthorized' || message === 'Invalid credentials' || error.response?.status === 401) {
        message = 'E-posta adresiniz veya şifreniz hatalı. Lütfen tekrar deneyin.';
      }
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  "user/register",
  async (payload: RegisterPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.post(`${server}/auth/register`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Kullanıcı kaydı yapılamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk(
  "user/logout",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.get(`${server}/auth/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem("accessToken");
      document.cookie = "token=; path=/; max-age=0";
      return null;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Çıkış yapılamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getMyProfile = createAsyncThunk(
  "user/getMyProfile",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.user;
    } catch (error: any) {
      let message = error.response?.data?.message || 'Profil bilgileri alınamadı';
      
      // Don't show technical errors for profile fetch failures
      if (message === 'Unauthorized' || error.response?.status === 401) {
        // Silently fail for unauthorized profile requests
        return thunkAPI.rejectWithValue(null);
      }
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const editProfile = createAsyncThunk(
  "user/editProfile",
  async (payload: EditProfilePayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.put(`${server}/auth/profile`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profil güncellenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.users;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Kullanıcılar alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const editUser = createAsyncThunk(
  "user/editUser",
  async (payload: EditUserPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { userId, ...userData } = payload;
      const { data } = await axios.put(`${server}/auth/users/${userId}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Kullanıcı güncellenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${server}/auth/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return userId;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Kullanıcı silinemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

