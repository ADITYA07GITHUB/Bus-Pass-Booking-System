// store/slices/adminSlice.ts - Admin state management

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AdminState } from "@/types";
import { RootState } from "../index";

const initialState: AdminState = {
  users: [],
  allPasses: [],
  analytics: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
};

const getAuthHeader = (getState: () => unknown) => {
  const state = getState() as RootState;
  return { Authorization: `Bearer ${state.auth.token}` };
};

export const fetchAllPasses = createAsyncThunk(
  "admin/fetchAllPasses",
  async (
    params: { page?: number; limit?: number; status?: string; search?: string } = {},
    { getState, rejectWithValue }
  ) => {
    try {
      const query = new URLSearchParams({
        page: String(params.page || 1),
        limit: String(params.limit || 10),
        ...(params.status && { status: params.status }),
        ...(params.search && { search: params.search }),
      });
      const response = await fetch(`/api/admin/passes?${query}`, {
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

export const updatePassStatus = createAsyncThunk(
  "admin/updatePassStatus",
  async (
    { passId, status, rejectionReason }: { passId: string; status: string; rejectionReason?: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/admin/passes/${passId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(getState),
        },
        body: JSON.stringify({ status, rejectionReason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update pass");
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  "admin/fetchAllUsers",
  async (
    params: { page?: number; limit?: number; search?: string } = {},
    { getState, rejectWithValue }
  ) => {
    try {
      const query = new URLSearchParams({
        page: String(params.page || 1),
        limit: String(params.limit || 10),
        ...(params.search && { search: params.search }),
      });
      const response = await fetch(`/api/admin/users?${query}`, {
        headers: getAuthHeader(getState),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch users");
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  "admin/fetchAnalytics",
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await fetch("/api/admin/analytics", {
        headers: getAuthHeader(getState),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch analytics");
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  "admin/toggleUserStatus",
  async (userId: string, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle`, {
        method: "PUT",
        headers: getAuthHeader(getState),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to toggle user status");
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPasses.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchAllPasses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allPasses = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllPasses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updatePassStatus.fulfilled, (state, action) => {
        const idx = state.allPasses.findIndex((p) => p._id === action.payload.data._id);
        if (idx !== -1) state.allPasses[idx] = action.payload.data;
      });

    builder
      .addCase(fetchAllUsers.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload.data;
      });

    builder
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u._id === action.payload.data._id);
        if (idx !== -1) state.users[idx] = action.payload.data;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
