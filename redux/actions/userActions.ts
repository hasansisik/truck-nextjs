import axios from "axios";
import { createAsyncThunk, createAction } from "@reduxjs/toolkit";
import { server } from "@/config";
import { safeLocalStorage, handleApiError, showSuccess, showPermissionDenied } from "@/lib/utils";

// Clear error action
export const clearError = createAction('user/clearError');

export interface LoginPayload {
  emailOrUsername: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email?: string;
  username?: string;
  password: string;
  role?: string;
  companyId?: string;
  isDriver?: boolean;
  license?: string;
  experience?: number;
}

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
}

export interface EditProfilePayload {
  name?: string;
  email?: string;
  companyId?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface EditUserPayload {
  userId: string;
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  role?: string;
  status?: string;
  companyId?: string;
  isDriver?: boolean;
  license?: string;
  experience?: number;
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
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.post(`${server}/auth/set-premium-status`, 
        { isPremium },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showSuccess("Premium durum başarıyla güncellendi");
      return data.user;
    } catch (error: any) {
      handleApiError(error, 'Premium durum güncellenemedi', true);
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Premium durum güncellenemedi');
    }
  }
);

// Kullanıcı kayıt işlemi (normal kullanıcılar için)
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (payload: RegisterUserPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/register-user`, payload);
      showSuccess("Kayıt başarılı", "Lütfen e-posta adresinizi doğrulayın.");
      return data;
    } catch (error: any) {
      handleApiError(error, 'Kullanıcı kaydı yapılamadı', true);
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Kullanıcı kaydı yapılamadı');
    }
  }
);

// Şifremi unuttum işlemi
export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (payload: ForgotPasswordPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/forgot-password`, payload);
      showSuccess("Şifre sıfırlama bağlantısı gönderildi", "Lütfen e-posta kutunuzu kontrol edin.");
      return data;
    } catch (error: any) {
      handleApiError(error, 'Şifre sıfırlama isteği gönderilemedi', true);
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Şifre sıfırlama isteği gönderilemedi');
    }
  }
);

// Şifre sıfırlama işlemi
export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async (payload: ResetPasswordPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/reset-password`, payload);
      showSuccess("Şifreniz başarıyla sıfırlandı", "Şimdi giriş yapabilirsiniz.");
      return data;
    } catch (error: any) {
      handleApiError(error, 'Şifre sıfırlanamadı', true);
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Şifre sıfırlanamadı');
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
      showSuccess("E-posta adresiniz başarıyla doğrulandı", "Şimdi giriş yapabilirsiniz.");
      return data;
    } catch (error: any) {
      handleApiError(error, 'Email doğrulanamadı', true);
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Email doğrulanamadı');
    }
  }
);

// Doğrulama kodunu tekrar gönderme
export const resendVerificationCode = createAsyncThunk(
  "user/resendVerificationCode",
  async (email: string, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/again-email`, { email });
      showSuccess("Doğrulama kodu gönderildi", "Lütfen e-posta kutunuzu kontrol edin.");
      return data;
    } catch (error: any) {
      handleApiError(error, 'Doğrulama kodu gönderilemedi', true);
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Doğrulama kodu gönderilemedi');
    }
  }
);

export const login = createAsyncThunk(
  "user/login",
  async (payload: LoginPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/login`, payload);
      const token = data.user.token;
      safeLocalStorage.setItem("accessToken", token);
      if (typeof document !== "undefined") {
        document.cookie = `token=${token}; path=/; max-age=86400`; // 24 hours
      }
      showSuccess("Giriş başarılı", "Hoş geldiniz!");
      return data.user;
    } catch (error: any) {
      let message = error.response?.data?.message || 'Giriş yapılamadı';
      
      // Convert technical error messages to user-friendly ones
      if (message === 'Unauthorized' || message === 'Invalid credentials' || error.response?.status === 401) {
        message = 'E-posta adresiniz veya şifreniz hatalı. Lütfen tekrar deneyin.';
      }
      
      handleApiError(error, message, true);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  "user/register",
  async (payload: RegisterPayload, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.post(`${server}/auth/register`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Kullanıcı başarıyla oluşturuldu");
      return data.user;
    } catch (error: any) {
      // Check for permission error
      if (error?.response?.status === 403) {
        showPermissionDenied();
      } else {
        handleApiError(error, 'Kullanıcı kaydı yapılamadı', true);
      }
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Kullanıcı kaydı yapılamadı');
    }
  }
);

export const logout = createAsyncThunk(
  "user/logout",
  async (_, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      await axios.get(`${server}/auth/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      safeLocalStorage.removeItem("accessToken");
      if (typeof document !== "undefined") {
        document.cookie = "token=; path=/; max-age=0";
      }
      return null;
    } catch (error: any) {
      handleApiError(error, 'Çıkış yapılamadı', true);
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Çıkış yapılamadı');
    }
  }
);

export const getMyProfile = createAsyncThunk(
  "user/getMyProfile",
  async (_, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      if (!token) {
        return thunkAPI.rejectWithValue(null);
      }
      
      const { data } = await axios.get(`${server}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.user;
    } catch (error: any) {
      handleApiError(error, 'Profil bilgileri alınamadı', false);
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Profil bilgileri alınamadı');
    }
  }
);

export const editProfile = createAsyncThunk(
  "user/editProfile",
  async (payload: EditProfilePayload, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.put(`${server}/auth/profile`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Profil başarıyla güncellendi");
      return data.user;
    } catch (error: any) {
      // Check for permission error
      if (error?.response?.status === 403) {
        showPermissionDenied();
      } else {
        handleApiError(error, 'Profil güncellenemedi');
      }
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Profil güncellenemedi');
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.users;
    } catch (error: any) {
      handleApiError(error, 'Kullanıcılar alınamadı');
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Kullanıcılar alınamadı');
    }
  }
);

export const editUser = createAsyncThunk(
  "user/editUser",
  async (payload: EditUserPayload, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { userId, ...userData } = payload;
      const { data } = await axios.put(`${server}/auth/users/${userId}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Kullanıcı bilgileri güncellendi");
      return data.user;
    } catch (error: any) {
      // Check for permission error
      if (error?.response?.status === 403) {
        showPermissionDenied();
      } else {
        handleApiError(error, 'Kullanıcı güncellenemedi');
      }
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Kullanıcı güncellenemedi');
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId: string, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      await axios.delete(`${server}/auth/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess("Kullanıcı başarıyla silindi");
      return userId;
    } catch (error: any) {
      // Check for permission error
      if (error?.response?.status === 403) {
        showPermissionDenied();
      } else {
        handleApiError(error, 'Kullanıcı silinemedi');
      }
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Kullanıcı silinemedi');
    }
  }
);

export const getAllDrivers = createAsyncThunk(
  "user/getAllDrivers",
  async (_, thunkAPI) => {
    try {
      const token = safeLocalStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/auth/drivers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.drivers;
    } catch (error: any) {
      handleApiError(error, 'Şoförler alınamadı');
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Şoförler alınamadı');
    }
  }
);

