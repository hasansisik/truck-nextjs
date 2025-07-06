import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"
import { format, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date and time in Turkish format (DD.MM.YYYY HH:mm)
export function formatDateTimeTR(date: Date | string | number): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (!isValid(dateObj)) return '-';
    return format(dateObj, 'dd.MM.yyyy HH:mm');
  } catch (error) {
    return '-';
  }
}

// Format date only in Turkish format (DD.MM.YYYY)
export function formatDateTR(date: Date | string | number): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (!isValid(dateObj)) return '-';
    return format(dateObj, 'dd.MM.yyyy');
  } catch (error) {
    return '-';
  }
}

// Safe localStorage implementation that works with SSR
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  },
};

// Handle API errors with Sonner notifications
export const handleApiError = (error: any, defaultMessage: string = "Bir hata oluştu", showToast: boolean = false) => {
  let errorMessage = defaultMessage;
  
  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error?.message) {
    errorMessage = error.message;
  }

  // Only show error toast if showToast is true
  if (showToast) {
    toast.error(errorMessage, {
      description: "Lütfen tekrar deneyin veya yöneticinize başvurun.",
      duration: 5000,
    });
  }
  
  return errorMessage;
};

// Show success notification
export const showSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 3000,
  });
};

// Show permission denied error
export const showPermissionDenied = () => {
  toast.error("Yetki Hatası", {
    description: "Bu işlemi yapmak için yeterli yetkiniz bulunmamaktadır.",
    duration: 5000,
  });
};
