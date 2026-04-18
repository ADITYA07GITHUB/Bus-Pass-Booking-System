// hooks/index.ts - Typed Redux hooks and custom hooks

import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { useCallback } from "react";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

// Typed Redux hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Auth hook - convenient access to auth state
export function useAuth() {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = useCallback(() => {
    dispatch(logout());
    router.push("/login");
  }, [dispatch, router]);

  return {
    ...auth,
    isAdmin: auth.user?.role === "admin",
    logout: handleLogout,
  };
}

// Pass hook - convenient access to pass state
export function usePasses() {
  return useAppSelector((state) => state.passes);
}

// Routes hook
export function useRoutes() {
  return useAppSelector((state) => state.routes);
}

// Admin hook
export function useAdmin() {
  return useAppSelector((state) => state.admin);
}
