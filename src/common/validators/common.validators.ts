import { z } from "zod";
import { QuestionType } from "@prisma/client";
import { AppError } from "../errors/app-error";

export const nonEmptyString = z.string().trim().min(1);

export const callbackIdSchema = z.string().trim().min(1);
export const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and URL-safe");
export const snakeCaseKeySchema = z
  .string()
  .trim()
  .regex(/^[a-z][a-z0-9_]*$/, "Question key must be snake_case");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Please provide a valid phone number");

export const normalizePhone = (value: string): string => {
  const raw = value.trim().replace(/[()\s-]/g, "");
  const normalized = raw.startsWith("00") ? `+${raw.slice(2)}` : raw.startsWith("+") ? raw : `+${raw}`;
  return normalized;
};

export const validateAnswerByType = (
  type: QuestionType,
  value: string,
  options?: string[]
): string => {
  const normalized = value.trim();

  if (type === QuestionType.TEXT) {
    if (!normalized) throw new AppError("Text answer cannot be empty", 400);
    return normalized;
  }

  if (type === QuestionType.NUMBER) {
    if (!normalized || Number.isNaN(Number(normalized))) {
      throw new AppError("Please enter a valid number", 400);
    }
    return normalized;
  }

  if (type === QuestionType.PHONE) {
    const phone = normalizePhone(normalized);
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      throw new AppError("Please provide a valid phone number", 400);
    }
    return parsed.data;
  }

  if (type === QuestionType.YES_NO) {
    const v = normalized.toLowerCase();
    if (!["yes", "no", "y", "n"].includes(v)) {
      throw new AppError("Please answer with Yes or No", 400);
    }
    return v === "yes" || v === "y" ? "Yes" : "No";
  }

  if (type === QuestionType.CHOICE) {
    const allowed = options ?? [];
    if (!allowed.length) {
      throw new AppError("Question options are not configured", 400);
    }
    const matched = allowed.find((x) => x.toLowerCase() === normalized.toLowerCase());
    if (!matched) {
      throw new AppError("Please choose one of the provided options", 400);
    }
    return matched;
  }

  throw new AppError("Unsupported question type", 400);
};

export const parseVacancyTitle = (value: string): string => {
  const parsed = nonEmptyString.safeParse(value);
  if (!parsed.success) throw new AppError("Vacancy title cannot be empty", 400);
  return parsed.data;
};

export const parseVacancySlug = (value: string): string => {
  const parsed = slugSchema.safeParse(value.trim());
  if (!parsed.success) throw new AppError("Vacancy slug must be lowercase and URL-safe", 400);
  return parsed.data;
};

export const parseQuestionKey = (value: string): string => {
  const parsed = snakeCaseKeySchema.safeParse(value.trim());
  if (!parsed.success) throw new AppError("Question key must be lowercase snake_case", 400);
  return parsed.data;
};

export const parseQuestionText = (value: string): string => {
  const parsed = nonEmptyString.safeParse(value);
  if (!parsed.success) throw new AppError("Question text cannot be empty", 400);
  return parsed.data;
};

export const parsePositiveOrder = (value: string): number => {
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) {
    throw new AppError("Order must be a positive integer", 400);
  }
  return n;
};

export const parseChoiceOptions = (value: string): string[] => {
  const options = value
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  if (options.length < 2) {
    throw new AppError("CHOICE questions must have at least 2 options", 400);
  }
  return Array.from(new Set(options));
};
