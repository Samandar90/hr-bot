import { CandidateDraft } from "../../types/application.types";
import { formatStatus } from "./messages";
import { escapeTelegramMarkdown, truncateForTelegram } from "../utils/telegram";

type VacancyView = {
  id?: string;
  title: string;
  slug?: string;
  description: string;
  isActive: boolean;
  questions?: Array<{
    id: string;
    order: number;
    key: string;
    question: string;
    type: string;
    isRequired: boolean;
  }>;
};

type ApplicationStatus = Parameters<typeof formatStatus>[0];

export const screens = {
  adminVacancies: (vacancies: Array<{ title: string; slug: string; isActive: boolean }>) => {
    if (!vacancies.length) return "📭 Hozircha vakansiyalar mavjud emas.";
    return [
      "💼 Vakansiyalar:",
      "",
      ...vacancies.map(
        (v, idx) => `${idx + 1}. ${v.title} (${v.slug}) - ${v.isActive ? "Faol" : "O'chirilgan"}`
      )
    ].join("\n");
  },

  adminVacancyCard: (vacancy: VacancyView) => {
    const qLines = vacancy.questions?.length
      ? vacancy.questions
          .map((q) => `${q.order}. ${q.key} [${q.type}]${q.isRequired ? " (majburiy)" : ""}\n${q.question}`)
          .join("\n\n")
      : "Hozircha savollar qo'shilmagan.";
    return [
      `💼 Vakansiya: ${vacancy.title}`,
      `🔗 Slug: ${vacancy.slug ?? "mavjud emas"}`,
      `📊 Holat: ${vacancy.isActive ? "Faol" : "O'chirilgan"}`,
      "",
      "📄 Tavsif:",
      vacancy.description,
      "",
      "📝 Savollar:",
      qLines,
    ].join("\n");
  },

  adminPrompt: (title: string, helper?: string) =>
    helper ? `${title}\n\n${helper}` : title,

  vacancyDetails: (vacancy: VacancyView) =>
    `💼 *${escapeTelegramMarkdown(vacancy.title)}*\n\n📄 ${escapeTelegramMarkdown(
      vacancy.description
    )}\n\n📊 Holat: ${
      vacancy.isActive ? "Faol" : "O'chirilgan"
    }`,

  candidateQuestion: (draft: CandidateDraft, currentIndex: number) => {
    const q = draft.questions[currentIndex];
    const hint = q.placeholder && q.type !== "CHOICE" && q.type !== "YES_NO" ? `\n\n💡 Maslahat: ${q.placeholder}` : "";
    return `❓ Savol ${currentIndex + 1}/${draft.questions.length}\n\n${q.question}${hint}`;
  },

  candidateConfirm: (draft: CandidateDraft) => {
    const lines = draft.answers.map(
      (answer, idx) =>
        `${idx + 1}. ${escapeTelegramMarkdown(answer.question)}\n${escapeTelegramMarkdown(answer.value)}`
    );
    return `🧾 *${escapeTelegramMarkdown(draft.vacancyTitle)}* uchun arizangiz:\n\n${lines.join("\n\n")}`;
  },

  adminApplicationCard: (
    application: {
      id: string;
      fullName: string | null;
      username: string | null;
      phone?: string | null;
      telegramId: bigint;
      status: ApplicationStatus;
      vacancy: VacancyView;
      answers: Array<{ answerText: string; question: { question: string } }>;
      notes: Array<{ note: string; createdAt: Date }>;
    }
  ) => {
    const answerLines =
      application.answers.length > 0
        ? application.answers
            .map(
              (answer, idx) =>
                `${idx + 1}. ${truncateForTelegram(answer.question.question, 180)}\n${truncateForTelegram(
                  answer.answerText,
                  500
                )}`
            )
            .join("\n\n")
        : "Javoblar mavjud emas.";
    const notes = application.notes.length
      ? application.notes.map((n) => `- ${n.note}`).join("\n")
      : "- izohlar yo'q";
    const usernameText = application.username ? `@${application.username}` : "yo'q";
    const phoneText = application.phone?.trim() ? application.phone : "yo'q";

    return [
      "📋 Nomzod arizasi",
      "",
      "👤 Nomzod:",
      `${application.fullName ?? "Noma'lum"}`,
      `${usernameText}`,
      "",
      "🆔 Telegram ID:",
      `${application.telegramId.toString()}`,
      "",
      "💼 Vakansiya:",
      `${application.vacancy.title}`,
      "",
      "📞 Telefon:",
      `${phoneText}`,
      "",
      "📊 Holat:",
      `${formatStatus(application.status)}`,
      "",
      "📝 Javoblar:",
      answerLines,
      "",
      "🗒 So'nggi izohlar:",
      notes
    ].join("\n");
  }
};
