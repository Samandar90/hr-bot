import { CandidateStatus } from "../../types/application.types";
import { Markup } from "telegraf";
import { ACTIONS, CALLBACK_PREFIX } from "../../config/constants";
import { CandidateQuestionDraft, QuestionType } from "../../types/application.types";

export const keyboards = {
  candidateHome: () =>
    Markup.inlineKeyboard([[Markup.button.callback("💼 Vakansiyalarni ko'rish", ACTIONS.CANDIDATE_VACANCIES)]]),

  vacancyList: (vacancies: Array<{ id: string; title: string }>) =>
    Markup.inlineKeyboard([
      ...vacancies.map((vacancy) => [
        Markup.button.callback(vacancy.title, `${CALLBACK_PREFIX.VACANCY_VIEW}${vacancy.id}`)
      ]),
      [Markup.button.callback("🏠 Bosh sahifa", ACTIONS.BACK_HOME)]
    ]),

  vacancyDetails: (vacancyId: string) =>
    Markup.inlineKeyboard([
      [Markup.button.callback("✅ Ariza topshirish", `${CALLBACK_PREFIX.VACANCY_APPLY}${vacancyId}`)],
      [Markup.button.callback("⬅️ Vakansiyalarga qaytish", ACTIONS.BACK_VACANCIES)]
    ]),

  candidateQuestion: (question: CandidateQuestionDraft, canBack: boolean) => {
    const answerButtons: Array<ReturnType<typeof Markup.button.callback>[]> = [];

    if (question.type === QuestionType.YES_NO) {
      answerButtons.push([
        Markup.button.callback("✅ Ha", `${CALLBACK_PREFIX.CANDIDATE_ANSWER}Yes`),
        Markup.button.callback("❌ Yo'q", `${CALLBACK_PREFIX.CANDIDATE_ANSWER}No`)
      ]);
    }

    if (question.type === QuestionType.CHOICE && question.options?.length) {
      for (const option of question.options) {
        answerButtons.push([
          Markup.button.callback(option, `${CALLBACK_PREFIX.CANDIDATE_ANSWER}${encodeURIComponent(option)}`)
        ]);
      }
    }

    const navButtons: Array<ReturnType<typeof Markup.button.callback>> = [];
    if (canBack) navButtons.push(Markup.button.callback("⬅️ Ortga", ACTIONS.CANDIDATE_BACK));
    navButtons.push(Markup.button.callback("❌ Bekor qilish", ACTIONS.CANDIDATE_CANCEL));

    return Markup.inlineKeyboard([...answerButtons, navButtons]);
  },

  candidateConfirm: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback("✅ Arizani yuborish", ACTIONS.CANDIDATE_SUBMIT)],
      [Markup.button.callback("⬅️ Ortga", ACTIONS.CANDIDATE_BACK)],
      [Markup.button.callback("❌ Bekor qilish", ACTIONS.CANDIDATE_CANCEL)]
    ]),

  adminMenu: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback("💼 Vakansiyalar", ACTIONS.ADMIN_VACANCIES)],
      [Markup.button.callback("📋 Nomzodlar", ACTIONS.ADMIN_APPLICATIONS)]
    ]),

  adminVacancies: (vacancies: Array<{ id: string; title: string; isActive: boolean }>) =>
    Markup.inlineKeyboard([
      ...vacancies.map((vacancy) => [
        Markup.button.callback(
          `${vacancy.title} (${vacancy.isActive ? "Faol" : "Yopiq"})`,
          `${CALLBACK_PREFIX.ADMIN_VACANCY_OPEN}${vacancy.id}`
        )
      ]),
      [Markup.button.callback("➕ Vakansiya qo'shish", ACTIONS.ADMIN_VACANCY_CREATE)],
      [Markup.button.callback("⬅️ Ortga", ACTIONS.ADMIN_MENU)]
    ]),

  adminVacancyCard: (
    vacancyId: string,
    isActive: boolean,
    questions: Array<{ id: string; order: number; key: string }>
  ) => {
    const rows: Array<Array<ReturnType<typeof Markup.button.callback>>> = [
      [
        Markup.button.callback("✏️ Nomi", `${CALLBACK_PREFIX.ADMIN_VACANCY_EDIT_TITLE}${vacancyId}`),
        Markup.button.callback("🔗 Slug", `${CALLBACK_PREFIX.ADMIN_VACANCY_EDIT_SLUG}${vacancyId}`)
      ],
      [
        Markup.button.callback(
          "📝 Tavsif",
          `${CALLBACK_PREFIX.ADMIN_VACANCY_EDIT_DESCRIPTION}${vacancyId}`
        )
      ],
      [
        Markup.button.callback(
          isActive ? "⏸ Yopish" : "✅ Faollashtirish",
          `${CALLBACK_PREFIX.ADMIN_VACANCY_TOGGLE}${vacancyId}`
        )
      ],
      [Markup.button.callback("➕ Savol qo'shish", `${CALLBACK_PREFIX.ADMIN_QUESTION_ADD}${vacancyId}`)]
    ];

    for (const question of questions) {
      rows.push([
        Markup.button.callback(
          `🗑 O'chirish #${question.order} ${question.key}`,
          `${CALLBACK_PREFIX.ADMIN_QUESTION_DELETE}${question.id}`
        )
      ]);
      rows.push([
        Markup.button.callback(
          `🔢 Tartib #${question.order} ${question.key}`,
          `${CALLBACK_PREFIX.ADMIN_QUESTION_REORDER}${question.id}`
        )
      ]);
    }

    rows.push([
      Markup.button.callback(
        "🗑 Vakansiyani o'chirish",
        `${CALLBACK_PREFIX.ADMIN_VACANCY_DELETE_CONFIRM}${vacancyId}`
      )
    ]);
    rows.push([Markup.button.callback("⬅️ Ortga", ACTIONS.ADMIN_VACANCY_BACK)]);
    return Markup.inlineKeyboard(rows);
  },

  adminQuestionTypePicker: (vacancyId: string) =>
    Markup.inlineKeyboard([
      [Markup.button.callback("📝 Matn", `${CALLBACK_PREFIX.ADMIN_QUESTION_TYPE}${vacancyId}:TEXT`)],
      [Markup.button.callback("🔢 Raqam", `${CALLBACK_PREFIX.ADMIN_QUESTION_TYPE}${vacancyId}:NUMBER`)],
      [Markup.button.callback("📞 Telefon", `${CALLBACK_PREFIX.ADMIN_QUESTION_TYPE}${vacancyId}:PHONE`)],
      [Markup.button.callback("📚 Tanlov", `${CALLBACK_PREFIX.ADMIN_QUESTION_TYPE}${vacancyId}:CHOICE`)],
      [Markup.button.callback("✅/❌ Ha-Yo'q", `${CALLBACK_PREFIX.ADMIN_QUESTION_TYPE}${vacancyId}:YES_NO`)],
      [Markup.button.callback("❌ Bekor qilish", ACTIONS.ADMIN_VACANCY_BACK)]
    ]),

  adminQuestionRequiredPicker: (vacancyId: string) =>
    Markup.inlineKeyboard([
      [Markup.button.callback("✅ Ha", `${CALLBACK_PREFIX.ADMIN_QUESTION_REQUIRED}${vacancyId}:yes`)],
      [Markup.button.callback("❌ Yo'q", `${CALLBACK_PREFIX.ADMIN_QUESTION_REQUIRED}${vacancyId}:no`)],
      [Markup.button.callback("❌ Bekor qilish", ACTIONS.ADMIN_VACANCY_BACK)]
    ]),

  adminSkipKeyboard: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback("⏭ O'tkazib yuborish", ACTIONS.ADMIN_SKIP)],
      [Markup.button.callback("❌ Bekor qilish", ACTIONS.ADMIN_VACANCY_BACK)]
    ]),

  adminCancelToVacancies: () =>
    Markup.inlineKeyboard([[Markup.button.callback("❌ Bekor qilish", ACTIONS.ADMIN_VACANCIES)]]),

  adminCancelToVacancyCard: () =>
    Markup.inlineKeyboard([[Markup.button.callback("❌ Bekor qilish", ACTIONS.ADMIN_VACANCY_BACK)]]),

  adminBackToApplication: (applicationId: string) =>
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅️ Ortga", `${CALLBACK_PREFIX.ADMIN_APPLICATION_VIEW}${applicationId}`)]
    ]),

  adminDeleteVacancyConfirm: (vacancyId: string) =>
    Markup.inlineKeyboard([
      [Markup.button.callback("✅ Tasdiqlash", `${CALLBACK_PREFIX.ADMIN_VACANCY_DELETE}${vacancyId}`)],
      [Markup.button.callback("❌ Bekor qilish", `${CALLBACK_PREFIX.ADMIN_VACANCY_OPEN}${vacancyId}`)]
    ]),

  adminApplications: (
    applications: Array<{ id: string; label: string }>,
    hasPrev: boolean,
    hasNext: boolean
  ) => {
    const navRow = [];
    if (hasPrev) navRow.push(Markup.button.callback("⬅️ Oldingi", `${CALLBACK_PREFIX.PAGE}admin-app-prev`));
    if (hasNext) navRow.push(Markup.button.callback("➡️ Keyingi", `${CALLBACK_PREFIX.PAGE}admin-app-next`));

    return Markup.inlineKeyboard([
      ...applications.map((app) => [
        Markup.button.callback(app.label, `${CALLBACK_PREFIX.ADMIN_APPLICATION_VIEW}${app.id}`)
      ]),
      ...(navRow.length > 0 ? [navRow] : []),
      [Markup.button.callback("⬅️ Ortga", ACTIONS.ADMIN_MENU)]
    ]);
  },

  adminApplicationCard: (applicationId: string) =>
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          "📞 Bog'lanildi",
          `${CALLBACK_PREFIX.ADMIN_STATUS_SET}${applicationId}:${CandidateStatus.CONTACTED}`
        ),
        Markup.button.callback(
          "🗓 Suhbat",
          `${CALLBACK_PREFIX.ADMIN_STATUS_SET}${applicationId}:${CandidateStatus.INTERVIEW}`
        )
      ],
      [
        Markup.button.callback(
          "❌ Rad etish",
          `${CALLBACK_PREFIX.ADMIN_STATUS_SET}${applicationId}:${CandidateStatus.REJECTED}`
        ),
        Markup.button.callback(
          "✅ Ishga olish",
          `${CALLBACK_PREFIX.ADMIN_STATUS_SET}${applicationId}:${CandidateStatus.HIRED}`
        )
      ],
      [Markup.button.callback("🗒 Izoh qo'shish", `${CALLBACK_PREFIX.ADMIN_ADD_NOTE}${applicationId}`)],
      [Markup.button.callback("⬅️ Ortga", ACTIONS.ADMIN_APPLICATIONS)]
    ])
};
