// types/index.ts - Global TypeScript type definitions

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  _id: string;
  source: string;
  destination: string;
  fare: number;
  distance?: number;
  duration?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PassStatus = "pending" | "approved" | "rejected" | "expired";
export type PassType = "monthly" | "quarterly" | "annual";

export interface BusPass {
  _id: string;
  userId: string | User;
  routeId: string | Route;
  passType: PassType;
  validFrom: string;
  validTo: string;
  status: PassStatus;
  qrCode?: string;
  passNumber: string;
  fare: number;
  rejectionReason?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface PassState {
  passes: BusPass[];
  currentPass: BusPass | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RouteState {
  routes: Route[];
  isLoading: boolean;
  error: string | null;
}

export interface AdminState {
  users: User[];
  allPasses: BusPass[];
  analytics: Analytics | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Analytics {
  totalUsers: number;
  totalPasses: number;
  pendingPasses: number;
  approvedPasses: number;
  rejectedPasses: number;
  expiredPasses: number;
  totalRevenue: number;
  revenueByMonth: { month: string; revenue: number }[];
  passesByType: { type: string; count: number }[];
  passesByStatus: { status: string; count: number }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface ApplyPassData {
  routeId: string;
  passType: PassType;
}
