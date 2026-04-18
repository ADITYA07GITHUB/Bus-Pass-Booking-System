// lib/utils.ts - Shared utility functions

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PassType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate pass validity end date based on pass type
 */
export function calculateValidityDate(startDate: Date, passType: PassType): Date {
  const end = new Date(startDate);
  switch (passType) {
    case "monthly":
      end.setMonth(end.getMonth() + 1);
      break;
    case "quarterly":
      end.setMonth(end.getMonth() + 3);
      break;
    case "annual":
      end.setFullYear(end.getFullYear() + 1);
      break;
  }
  return end;
}

/**
 * Calculate fare multiplier based on pass type
 */
export function getFareMultiplier(passType: PassType): number {
  switch (passType) {
    case "monthly":
      return 22; // ~22 working days
    case "quarterly":
      return 60; // Discounted quarterly
    case "annual":
      return 210; // Further discounted annual
    default:
      return 1;
  }
}

/**
 * Format currency in INR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Generate unique pass number
 */
export function generatePassNumber(): string {
  const prefix = "BPS";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Check if a pass is expired
 */
export function isPassExpired(validTo: string | Date): boolean {
  return new Date(validTo) < new Date();
}

/**
 * Get status badge color class
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";
    case "expired":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
