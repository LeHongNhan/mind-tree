import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProgressColor(progress: number): string {
  if (progress <= 30) return '#ff6b6b'
  if (progress <= 60) return '#ffd93d'
  if (progress <= 90) return '#4ecdc4'
  return '#00d4aa'
}

export function getProgressGradient(progress: number): string {
  if (progress <= 30) return 'from-red-500 to-orange-500'
  if (progress <= 60) return 'from-yellow-400 to-amber-500'
  if (progress <= 90) return 'from-teal-400 to-cyan-500'
  return 'from-emerald-400 to-green-500'
}
