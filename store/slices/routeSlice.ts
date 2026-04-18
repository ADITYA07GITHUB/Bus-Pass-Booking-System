// store/slices/routeSlice.ts - Route state management

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RouteState } from "@/types";
import { RootState } from "../index";

const initialState: RouteState = {
  routes: [],
  isLoading: false,
  error: null,
};

const getAuthHeader = (getState: () => unknown) => {
  const state = getState() as RootState;
  return { Authorization: `Bearer ${state.auth.token}` };
};

export const fetchRoutes = createAsyncThunk(
  "routes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/routes");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch routes");
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createRoute = createAsyncThunk(
  "routes/create",
  async (
    routeData: { source: string; destination: string; fare: number; distance?: number; duration?: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(getState),
        },
        body: JSON.stringify(routeData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create route");
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateRoute = createAsyncThunk(
  "routes/update",
  async (
    { id, ...routeData }: { id: string; source?: string; destination?: string; fare?: number; isActive?: boolean },
    { getState, rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/routes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(getState),
        },
        body: JSON.stringify(routeData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update route");
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteRoute = createAsyncThunk(
  "routes/delete",
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`/api/routes/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(getState),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete route");
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const routeSlice = createSlice({
  name: "routes",
  initialState,
  reducers: {
    clearRouteError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoutes.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.routes = action.payload.data;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createRoute.fulfilled, (state, action) => {
        state.routes.push(action.payload.data);
      });

    builder
      .addCase(updateRoute.fulfilled, (state, action) => {
        const idx = state.routes.findIndex((r) => r._id === action.payload.data._id);
        if (idx !== -1) state.routes[idx] = action.payload.data;
      });

    builder
      .addCase(deleteRoute.fulfilled, (state, action) => {
        state.routes = state.routes.filter((r) => r._id !== action.payload);
      });
  },
});

export const { clearRouteError } = routeSlice.actions;
export default routeSlice.reducer;
