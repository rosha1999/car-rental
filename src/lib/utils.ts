import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatIQD(amount: number | null | undefined): string {
  if (amount == null) return "0 IQD";
  return `${Math.round(amount).toLocaleString("en-US")} IQD`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric", timeZone:"Asia/Baghdad" });
  } catch { return "-"; }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", timeZone:"Asia/Baghdad" });
  } catch { return "-"; }
}

export function daysBetween(start: string | Date, end: string | Date): number {
  const s = new Date(start);
  const e = new Date(end);
  const diff = e.getTime() - s.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function daysRemaining(endDate: string | Date): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function daysOverdue(endDate: string | Date): number {
  return Math.max(0, -daysRemaining(endDate));
}

export function carStatusColor(status: string): string {
  switch (status) {
    case "AVAILABLE":   return "bg-green-100 text-green-700";
    case "RENTED":      return "bg-orange-100 text-orange-700";
    case "RESERVED":    return "bg-yellow-100 text-yellow-700";
    case "MAINTENANCE": return "bg-blue-100 text-blue-700";
    case "INACTIVE":    return "bg-gray-100 text-gray-500";
    default:            return "bg-gray-100 text-gray-600";
  }
}

export function rentalStatusColor(status: string): string {
  switch (status) {
    case "ACTIVE":    return "bg-blue-100 text-blue-700";
    case "OVERDUE":   return "bg-red-100 text-red-700";
    case "RESERVED":  return "bg-yellow-100 text-yellow-700";
    case "COMPLETED": return "bg-green-100 text-green-700";
    case "CANCELLED": return "bg-gray-100 text-gray-500";
    default:          return "bg-gray-100 text-gray-600";
  }
}

export function reservationStatusColor(status: string): string {
  switch (status) {
    case "PENDING":              return "bg-yellow-100 text-yellow-700";
    case "CONFIRMED":            return "bg-green-100 text-green-700";
    case "CANCELLED":            return "bg-gray-100 text-gray-500";
    case "CONVERTED_TO_RENTAL":  return "bg-blue-100 text-blue-700";
    default:                     return "bg-gray-100 text-gray-600";
  }
}