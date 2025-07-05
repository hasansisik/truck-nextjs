import { createReducer } from "@reduxjs/toolkit";
import {
  getAllCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  clearCompanyError
} from "../actions/companyActions";

export interface Company {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  status?: string;
}

interface CompanyState {
  companies: Company[];
  currentCompany: Company | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: CompanyState = {
  companies: [],
  currentCompany: null,
  loading: false,
  error: null,
  success: false,
};

export const companyReducer = createReducer(initialState, (builder) => {
  builder
    // Clear error action
    .addCase(clearCompanyError, (state) => {
      state.error = null;
    })
    
    // Get All Companies
    .addCase(getAllCompanies.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getAllCompanies.fulfilled, (state, action) => {
      state.loading = false;
      state.companies = action.payload;
      state.error = null;
    })
    .addCase(getAllCompanies.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    
    // Get Single Company
    .addCase(getCompany.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getCompany.fulfilled, (state, action) => {
      state.loading = false;
      state.currentCompany = action.payload;
      state.error = null;
    })
    .addCase(getCompany.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    
    // Create Company
    .addCase(createCompany.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(createCompany.fulfilled, (state, action) => {
      state.loading = false;
      state.companies = [...state.companies, action.payload];
      state.success = true;
      state.error = null;
    })
    .addCase(createCompany.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })
    
    // Update Company
    .addCase(updateCompany.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(updateCompany.fulfilled, (state, action) => {
      state.loading = false;
      state.companies = state.companies.map(company => 
        company._id === action.payload._id ? action.payload : company
      );
      state.currentCompany = action.payload;
      state.success = true;
      state.error = null;
    })
    .addCase(updateCompany.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })
    
    // Delete Company
    .addCase(deleteCompany.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(deleteCompany.fulfilled, (state, action) => {
      state.loading = false;
      state.companies = state.companies.filter(company => company._id !== action.payload);
      state.success = true;
      state.error = null;
    })
    .addCase(deleteCompany.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    });
}); 