import { createReducer } from "@reduxjs/toolkit";
import {
  getAllTows,
  getTow,
  createTow,
  updateTow,
  deleteTow,
} from "../actions/towActions";

interface TowState {
  tows: any[];
  currentTow: any;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: TowState = {
  tows: [],
  currentTow: null,
  loading: false,
  error: null,
  success: false,
};

export const towReducer = createReducer(initialState, (builder) => {
  builder
    // Clear error action
    .addCase('tow/clearError', (state) => {
      state.error = null;
    })
    
    // Get All Tows
    .addCase(getAllTows.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getAllTows.fulfilled, (state, action) => {
      state.loading = false;
      state.tows = action.payload;
      state.error = null;
    })
    .addCase(getAllTows.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    
    // Get Single Tow
    .addCase(getTow.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getTow.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTow = action.payload;
      state.error = null;
    })
    .addCase(getTow.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    
    // Create Tow
    .addCase(createTow.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(createTow.fulfilled, (state, action) => {
      state.loading = false;
      state.tows = [...state.tows, action.payload];
      state.success = true;
      state.error = null;
    })
    .addCase(createTow.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })
    
    // Update Tow
    .addCase(updateTow.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(updateTow.fulfilled, (state, action) => {
      state.loading = false;
      state.tows = state.tows.map(tow => 
        tow._id === action.payload._id ? action.payload : tow
      );
      state.currentTow = action.payload;
      state.success = true;
      state.error = null;
    })
    .addCase(updateTow.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })
    
    // Delete Tow
    .addCase(deleteTow.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(deleteTow.fulfilled, (state, action) => {
      state.loading = false;
      state.tows = state.tows.filter(tow => tow._id !== action.payload);
      state.success = true;
      state.error = null;
    })
    .addCase(deleteTow.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    });
});

export default towReducer; 