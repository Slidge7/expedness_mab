import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  transactionService,
  TransactionDTO,
} from '../features/transactions/api/transactionService';

interface TransactionState {
  items: TransactionDTO[];
  loading: boolean;
  totalBalance: number;
}

const initialState: TransactionState = {
  items: [],
  loading: false,
  totalBalance: 0,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async () => {
    return await transactionService.getAll();
  },
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTransactions.pending, state => {
        state.loading = true;
      })
      .addCase(
        fetchTransactions.fulfilled,
        (state, action: PayloadAction<TransactionDTO[]>) => {
          state.loading = false;
          state.items = action.payload;
          // Use totalAmount (the field the backend returns)
          state.totalBalance = action.payload.reduce((acc, curr) => {
            return curr.type === 'INCOME'
              ? acc + (curr.totalAmount ?? 0)
              : acc - (curr.totalAmount ?? 0);
          }, 0);
        },
      )
      .addCase(fetchTransactions.rejected, state => {
        state.loading = false;
      });
  },
});

export default transactionSlice.reducer;
