import { createReducer } from "@reduxjs/toolkit";
import {
  getAllExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../actions/expenseActions";

interface ExpenseState {
  expenses: any[];
  currentExpense: any;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ExpenseState = {
  expenses: [],
  currentExpense: null,
  loading: false,
  error: null,
  success: false,
};

export const expenseReducer = createReducer(initialState, (builder) => {
  builder
    // Clear error action
    .addCase('expense/clearError', (state) => {
      state.error = null;
    })
    
    // Get All Expenses
    .addCase(getAllExpenses.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getAllExpenses.fulfilled, (state, action) => {
      state.loading = false;
      state.expenses = action.payload;
      state.error = null;
    })
    .addCase(getAllExpenses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    
    // Get Single Expense
    .addCase(getExpense.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getExpense.fulfilled, (state, action) => {
      state.loading = false;
      state.currentExpense = action.payload;
      state.error = null;
    })
    .addCase(getExpense.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    
    // Create Expense
    .addCase(createExpense.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(createExpense.fulfilled, (state, action) => {
      state.loading = false;
      state.expenses = [...state.expenses, action.payload];
      state.success = true;
      state.error = null;
    })
    .addCase(createExpense.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })
    
    // Update Expense
    .addCase(updateExpense.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(updateExpense.fulfilled, (state, action) => {
      state.loading = false;
      state.expenses = state.expenses.map(expense => 
        expense._id === action.payload._id ? action.payload : expense
      );
      state.currentExpense = action.payload;
      state.success = true;
      state.error = null;
    })
    .addCase(updateExpense.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })
    
    // Delete Expense
    .addCase(deleteExpense.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(deleteExpense.fulfilled, (state, action) => {
      state.loading = false;
      state.expenses = state.expenses.filter(expense => expense._id !== action.payload);
      state.success = true;
      state.error = null;
    })
    .addCase(deleteExpense.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    });
});

export default expenseReducer; 