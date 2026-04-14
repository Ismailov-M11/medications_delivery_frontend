import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'UZS'): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' ' + currency
}

export function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  } catch {
    return dateString
  }
}

export function truncateToken(token: string, length = 8): string {
  return token.substring(0, length).toUpperCase()
}

export function buildOrderUrl(token: string): string {
  return `${window.location.origin}/order/${token}`
}
