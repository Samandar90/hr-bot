import { BotContext } from "../../types/bot.types";

export const getTelegramId = (ctx: BotContext): bigint => {
  return BigInt(ctx.from?.id ?? 0);
};

export const getCandidateLabel = (ctx: BotContext): string => {
  const firstName = ctx.from?.first_name ?? "Candidate";
  const username = ctx.from?.username ? `@${ctx.from.username}` : "no_username";
  return `${firstName} (${username})`;
};

export const getCallbackData = (ctx: BotContext): string => {
  if (ctx.callbackQuery && "data" in ctx.callbackQuery) {
    return ctx.callbackQuery.data ?? "";
  }
  return "";
};

export const escapeTelegramMarkdown = (value: string): string => {
  return value.replace(/([_*`\[])/g, "\\$1");
};

export const truncateForTelegram = (value: string, maxLength: number): string => {
  if (maxLength <= 0) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
};

export const toUserFriendlyError = (message?: string): string => {
  if (!message) return "⚠️ Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";
  const lowered = message.toLowerCase();

  if (lowered.includes("already applied")) {
    return "ℹ️ Siz bu vakansiyaga allaqachon ariza topshirgansiz.";
  }
  if (lowered.includes("no active draft") || lowered.includes("no active application flow")) {
    return "⚠️ Ushbu amal eskirgan. Iltimos, qaytadan boshlang.";
  }
  if (lowered.includes("application is incomplete")) {
    return "⚠️ Ariza hali to'liq emas. Barcha savollarga javob bering.";
  }
  if (lowered.includes("application not found")) {
    return "⚠️ Ariza topilmadi yoki bu amal eskirgan.";
  }
  if (lowered.includes("vacancy not available")) {
    return "⚠️ Ushbu vakansiya hozir mavjud emas.";
  }
  if (lowered.includes("vacancy not found")) {
    return "⚠️ Vakansiya topilmadi.";
  }
  if (lowered.includes("vacancy is not selected")) {
    return "⚠️ Vakansiya tanlanmagan. Iltimos, qaytadan tanlang.";
  }
  if (lowered.includes("vacancy draft is incomplete")) {
    return "⚠️ Vakansiya ma'lumotlari to'liq emas. Qaytadan urinib ko'ring.";
  }
  if (lowered.includes("vacancy description cannot be empty")) {
    return "⚠️ Vakansiya tavsifi bo'sh bo'lmasligi kerak.";
  }
  if (lowered.includes("question not found")) {
    return "⚠️ Savol topilmadi yoki bu amal eskirgan.";
  }
  if (lowered.includes("question draft is incomplete")) {
    return "⚠️ Savol ma'lumotlari to'liq emas. Qaytadan urinib ko'ring.";
  }
  if (lowered.includes("placeholder cannot be empty")) {
    return "⚠️ Yordamchi matn bo'sh bo'lmasligi kerak.";
  }
  if (lowered.includes("this command is only available for admin")) {
    return "❌ Bu buyruq faqat admin uchun mavjud.";
  }

  return message;
};
