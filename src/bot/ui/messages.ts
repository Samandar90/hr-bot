import { CandidateStatus } from "../../types/application.types";

export const messages = {
  welcome: (firstName?: string) =>
    `👋 Assalomu alaykum${firstName ? `, ${firstName}` : ""}!\n\nIshga ariza topshirish uchun quyidagi vakansiyalardan birini tanlang.`,
  emptyVacancies: "😕 Hozircha faol vakansiyalar mavjud emas. Iltimos, keyinroq qayta urinib ko'ring.",
  pickVacancy: "💼 Quyidagi faol vakansiyalardan birini tanlang:",
  applyIntro: "🚀 Ariza topshirishga tayyormisiz? Quyidagi tugmani bosing.",
  flowCancelled: "❌ Ariza topshirish jarayoni bekor qilindi.",
  flowReset: "🔄 Jarayon yangilandi. Davom etish uchun qaytadan tanlang.",
  confirmSubmit: "📝 Javoblaringizni tekshirib chiqing va yuborishni tasdiqlang.",
  success: "✅ Arizangiz muvaffaqiyatli yuborildi!\n\nTez orada siz bilan bog'lanamiz.",
  alreadyApplied: "ℹ️ Siz bu vakansiyaga allaqachon ariza topshirgansiz.",
  adminDenied: "❌ Bu buyruq faqat admin uchun mavjud.",
  adminMenu: "⚙️ Admin panel",
  adminVacanciesMenu: "💼 Vakansiyalar boshqaruvi",
  adminNoApplications: "📭 Hozircha arizalar mavjud emas.",
  adminNoVacancies: "📭 Hozircha vakansiyalar yo'q. Birinchi vakansiyani yarating.",
  adminCreateVacancyTitle: "📝 Vakansiya nomini kiriting:",
  adminCreateVacancySlug: "🔗 Vakansiya slugini kiriting (kichik harflar, URL uchun mos):",
  adminCreateVacancyDescription: "📄 Vakansiya tavsifini kiriting:",
  adminEditVacancyTitle: "✏️ Yangi nomni yuboring:",
  adminEditVacancySlug: "🔁 Yangi slugni yuboring:",
  adminEditVacancyDescription: "🧾 Yangi tavsifni yuboring:",
  adminVacancySaved: "✅ Vakansiya saqlandi.",
  adminVacancyDeleted: "🗑 Vakansiya o'chirildi.",
  adminQuestionCreateKey: "🔑 Savol kalitini kiriting (snake_case):",
  adminQuestionCreateText: "❓ Savol matnini kiriting:",
  adminQuestionCreateType: "📚 Savol turini tanlang:",
  adminQuestionCreateRequired: "❗ Ushbu savol majburiymi?",
  adminQuestionCreatePlaceholder: "💬 Yordamchi matnni kiriting yoki O'tkazib yuborish tugmasini bosing.",
  adminQuestionCreateOptions: "🧩 Variantlarni vergul bilan kiriting (kamida 2 ta).",
  adminQuestionSaved: "✅ Savol qo'shildi.",
  adminQuestionDeleted: "🗑 Savol o'chirildi.",
  adminQuestionOrderPrompt: "🔢 Yangi tartib raqamini yuboring (musbat butun son).",
  adminQuestionOrderUpdated: "✅ Savol tartibi yangilandi.",
  adminDeleteVacancyConfirm: "⚠️ Rostdan ham bu vakansiyani o'chirmoqchimisiz?",
  inputRequired: "✍️ Davom etish uchun matnli javob yuboring.",
  staleAction: "⚠️ Ushbu tugma eskirgan. Iltimos, yangilangan ekrandan davom eting.",
  callbackHandled: "✅ Amal bajarildi.",
  adminNotePrompt: "🗒 Nomzod uchun ichki izoh matnini yuboring.",
  adminNoteSaved: "✅ Ichki izoh qo'shildi.",
  internalError: "⚠️ Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
};

export const withValidationHint = (hint: string, body: string): string =>
  `⚠️ Kiritishda xatolik: ${hint}\n\n${body}`;

export const formatStatus = (status: CandidateStatus): string => {
  switch (status) {
    case CandidateStatus.NEW:
      return "Yangi";
    case CandidateStatus.CONTACTED:
      return "Bog'lanilgan";
    case CandidateStatus.INTERVIEW:
      return "Suhbat";
    case CandidateStatus.REJECTED:
      return "Rad etilgan";
    case CandidateStatus.HIRED:
      return "Ishga olingan";
    default:
      return status;
  }
};
