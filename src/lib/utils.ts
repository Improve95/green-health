import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ReportStatus } from "@/types/api";
import type { ContentType, ViewMode } from "@/types/app";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_LABELS: Record<ReportStatus, string> = {
  analyzing: "Анализируется",
  completed: "Завершено",
  error: "Ошибка",
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  photo: "Фото",
  video: "Видео",
  streaming: "Трансляция",
};

export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  analyse: "Анализ",
  report: "Отчёты",
};

export function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
