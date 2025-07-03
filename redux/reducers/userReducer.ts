import { createReducer } from "@reduxjs/toolkit";
import {
  login,
  logout,
  register,
  getMyProfile,
  editProfile,
  getAllUsers,
  editUser,
  deleteUser,
  registerUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationCode,
  setPremiumStatus
} from "../actions/userActions";

interface userState {
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  message?: string;
  users: any[];
  success?: boolean;
  verificationSuccess?: boolean;
  forgotPasswordSuccess?: boolean;
  resetPasswordSuccess?: boolean;
  registerSuccess?: boolean;
  premiumStatusSuccess?: boolean;
}

const initialState: userState = {
  user: {},
  loading: false,
  error: null,
  isAuthenticated: false,
  users: [],
  success: false,
  verificationSuccess: false,
  forgotPasswordSuccess: false,
  resetPasswordSuccess: false,
  registerSuccess: false,
  premiumStatusSuccess: false,
};

export const userReducer = createReducer(initialState, (builder) => {
  builder
    // Clear error action
    .addCase('user/clearError', (state) => {
      state.error = null;
    })
    // Set Premium Status
    .addCase(setPremiumStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.premiumStatusSuccess = false;
    })
    .addCase(setPremiumStatus.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.user = action.payload || { ...state.user, isPremium: true };
      state.message = "Premium durum başarıyla güncellendi.";
      state.premiumStatusSuccess = true;
    })
    .addCase(setPremiumStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.premiumStatusSuccess = false;
    })
    
    // RegisterUser
    .addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.registerSuccess = false;
    })
    .addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = action.payload.message || "Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın.";
      state.registerSuccess = true;
    })
    .addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.registerSuccess = false;
    })
    
    // ForgotPassword
    .addCase(forgotPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.forgotPasswordSuccess = false;
    })
    .addCase(forgotPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = action.payload.msg || "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.";
      state.forgotPasswordSuccess = true;
    })
    .addCase(forgotPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.forgotPasswordSuccess = false;
    })
    
    // ResetPassword
    .addCase(resetPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.resetPasswordSuccess = false;
    })
    .addCase(resetPassword.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
      state.message = "Şifreniz başarıyla sıfırlandı.";
      state.resetPasswordSuccess = true;
    })
    .addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.resetPasswordSuccess = false;
    })
    
    // VerifyEmail
    .addCase(verifyEmail.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.verificationSuccess = false;
    })
    .addCase(verifyEmail.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = action.payload.message || "E-posta adresiniz başarıyla doğrulandı.";
      state.verificationSuccess = true;
    })
    .addCase(verifyEmail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.verificationSuccess = false;
    })
    
    // Register
    .addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.users = [...state.users, action.payload];
      state.success = true;
      state.message = "Kullanıcı başarıyla oluşturuldu.";
      state.error = null;
    })
    .addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })
    
    // Login
    .addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    })
    .addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ? action.payload as string : null;
      state.isAuthenticated = false;
    })
    
    // Logout
    .addCase(logout.pending, (state) => {
      state.loading = true;
    })
    .addCase(logout.fulfilled, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.users = [];
    })
    .addCase(logout.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    
    // Get My Profile
    .addCase(getMyProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getMyProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    })
    .addCase(getMyProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ? action.payload as string : null;
      state.isAuthenticated = false;
    })
    
    // Edit Profile
    .addCase(editProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(editProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.success = true;
      state.message = "Profil başarıyla güncellendi";
      state.error = null;
    })
    .addCase(editProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })
    
    // Get All Users
    .addCase(getAllUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getAllUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.users = action.payload;
      state.error = null;
    })
    .addCase(getAllUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    
    // Edit User
    .addCase(editUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(editUser.fulfilled, (state, action) => {
      state.loading = false;
      state.users = state.users.map(user => 
        user._id === action.payload._id ? action.payload : user
      );
      state.success = true;
      state.message = "Kullanıcı bilgileri güncellendi";
      state.error = null;
    })
    .addCase(editUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })
    
    // Delete User
    .addCase(deleteUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteUser.fulfilled, (state, action) => {
      state.loading = false;
      state.users = state.users.filter(user => user._id !== action.payload);
      state.success = true;
      state.message = "Kullanıcı başarıyla silindi";
      state.error = null;
    })
    .addCase(deleteUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    });
});

export default userReducer;