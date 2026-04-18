// store/slices/passSlice.ts - Bus pass state management

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PassState, ApplyPassData } from "@/types";
import { RootState } from "../index";

const initialState: PassState = {
  passes: [],
  currentPass: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
};

// Helper to get auth header
const getAuthHeader = (getState: () => unknown) => {
  const state = getState() as RootState;
  return { Authorization: `Bearer ${state.auth.token}` };
};

export const fetchMyPasses = createAsyncThunk(
  "passes/fetchMy",
  async (
    params: { page?: number; limit?: number; status?: string } = {},
    { getState, rejectWithValue }
  ) => {
    try {
      const query = new URLSearchParams({
        page: String(params.page || 1),
        limit: String(params.limit || 10),
        ...(params.status && { status: params.status }),
      });
      const response = await fetch(`/api/passes?${query}`, {
        headers: getAuthHeader(getState),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch passes");
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const applyForPass = createAsyncThunk(
  "passes/apply",
  async (passData: ApplyPassData, { getState, rejectWithValue }) => {
    try {
      const response = await fetch("/api/passes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(getState),
        },
        body: JSON.stringify(passData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to apply for pass");
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const renewPass = createAsyncThunk(
  "passes/renew",
  async (passId: string, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`/api/passes/${passId}/renew`, {
        method: "POST",
        headers: getAuthHeader(getState),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to renew pass");
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchPassById = createAsyncThunk(
  "passes/fetchById",
  async (passId: string, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`/api/passes/${passId}`, {
        headers: getAuthHeader(getState),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch pass");
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const passSlice = createSlice({
  name: "passes",
  initialState,
  reducers: {
    clearPassError: (state) => {
      state.error = null;
    },
    clearCurrentPass: (state) => {
      state.currentPass = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPasses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyPasses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.passes = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyPasses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(applyForPass.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyForPass.fulfilled, (state, action) => {
        state.isLoading = false;
        state.passes.unshift(action.payload.data);
      })
      .addCase(applyForPass.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchPassById.fulfilled, (state, action) => {
        state.currentPass = action.payload.data;
      });

    builder
      .addCase(renewPass.fulfilled, (state, action) => {
        const index = state.passes.findIndex((p) => p._id === action.payload.data._id);
        if (index !== -1) state.passes[index] = action.payload.data;
      });
  },
});

export const { clearPassError, clearCurrentPass } = passSlice.actions;
export default passSlice.reducer;
