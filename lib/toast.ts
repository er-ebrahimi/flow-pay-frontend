import { toast } from "sonner";

/**
 * Shared toast id so error toasts replace each other instead of stacking
 * duplicates on screen. Every API error toast must use it.
 */
export const API_ERROR_TOAST_ID = "api-error";

export function showApiErrorToast(message: string) {
  toast.error(message, { id: API_ERROR_TOAST_ID });
}

export function showApiSuccessToast(message: string) {
  toast.success(message);
}
