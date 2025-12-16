import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export class ApiError extends Error {
  status?: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status?: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function handleApiError(error: unknown, defaultMessage = 'Bir hata oluştu'): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    const message = data?.message || defaultMessage;
    const errors = data?.errors;

    switch (status) {
      case 401:
        toast.error('Lütfen giriş yapın');
        break;
      case 403:
        toast.error('Bu işlemi gerçekleştirme izniniz yok');
        break;
      case 404:
        toast.error('Kayıt bulunamadı');
        break;
      case 422:
        if (errors) {
          Object.entries(errors).forEach(([field, messages]) => {
            toast.error(`${field}: ${messages.join(', ')}`);
          });
        } else {
          toast.error(message);
        }
        break;
      case 429:
        toast.error('Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin');
        break;
      case 500:
        toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin');
        break;
      default:
        toast.error(message);
    }

    return new ApiError(message, status, errors);
  }

  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  toast.error(errorMessage);
  return new ApiError(errorMessage);
}

export function createErrorMessage(errors?: Record<string, string[]>): string {
  if (!errors) return '';
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('\n');
}
