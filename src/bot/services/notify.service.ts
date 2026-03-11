import { Telegraf } from "telegraf";
import { BotContext } from "../../types/bot.types";
import { env } from "../../config/env";
import { CandidateStatus } from "../../types/application.types";
import { CALLBACK_PREFIX } from "../../config/constants";
import { Markup } from "telegraf";
import { formatStatus } from "../ui/messages";
import { truncateForTelegram } from "../utils/telegram";

export class NotifyService {
  constructor(private readonly bot: Telegraf<BotContext>) {}

  async notifyAdminNewApplication(payload: {
    applicationId: string;
    fullName?: string | null;
    username?: string | null;
    telegramId: bigint;
    vacancyTitle: string;
    phone?: string | null;
    status: CandidateStatus;
    answers: Array<{ question: string; answer: string }>;
  }) {
    const answerLines = payload.answers.length
      ? payload.answers
          .map(
            (item, index) =>
              `${index + 1}. ${truncateForTelegram(item.question, 180)}\n${truncateForTelegram(
                item.answer,
                500
              )}`
          )
          .join("\n\n")
      : "Javoblar mavjud emas.";

    const usernameText = payload.username ? `@${payload.username}` : "yo'q";
    const phoneText = payload.phone?.trim() ? payload.phone : "yo'q";

    const text = [
      "🆕 Yangi ariza keldi!",
      "",
      `👤 Nomzod: ${truncateForTelegram(payload.fullName ?? "Noma'lum", 120)}`,
      `📎 Username: ${usernameText}`,
      `🆔 Telegram ID: ${payload.telegramId.toString()}`,
      `💼 Vakansiya: ${truncateForTelegram(payload.vacancyTitle, 160)}`,
      `📞 Telefon: ${phoneText}`,
      `📊 Holat: ${formatStatus(payload.status)}`,
      "",
      "📝 Javoblar:",
      answerLines
    ].join("\n");

    const safeText = truncateForTelegram(text, 3900);

    const statusButtons = Markup.inlineKeyboard([
      [
        Markup.button.callback(
          "📞 Bog'lanildi",
          `${CALLBACK_PREFIX.ADMIN_STATUS_SET}${payload.applicationId}:${CandidateStatus.CONTACTED}`
        ),
        Markup.button.callback(
          "🗓 Suhbat",
          `${CALLBACK_PREFIX.ADMIN_STATUS_SET}${payload.applicationId}:${CandidateStatus.INTERVIEW}`
        )
      ],
      [
        Markup.button.callback(
          "❌ Rad etish",
          `${CALLBACK_PREFIX.ADMIN_STATUS_SET}${payload.applicationId}:${CandidateStatus.REJECTED}`
        ),
        Markup.button.callback(
          "✅ Ishga olish",
          `${CALLBACK_PREFIX.ADMIN_STATUS_SET}${payload.applicationId}:${CandidateStatus.HIRED}`
        )
      ]
    ]);

    try {
      await this.bot.telegram.sendMessage(Number(env.ADMIN_TELEGRAM_ID), safeText, statusButtons);
    } catch {
      // no-op: bot keeps working even if notification fails
    }
  }
}
