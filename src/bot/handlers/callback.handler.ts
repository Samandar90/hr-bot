import { ACTIONS, CALLBACK_PREFIX } from "../../config/constants";
import { BotContext } from "../../types/bot.types";
import type { CandidateStatus, QuestionType } from "../../types/application.types";
import { messages } from "../ui/messages";
import { toUserFriendlyError } from "../utils/telegram";
import { AppError } from "../../common/errors/app-error";
import { AdminHandler } from "./admin.handler";
import { CandidateHandler } from "./candidate.handler";

export const handleCallbackQuery = async (
  ctx: BotContext,
  deps: { adminHandler: AdminHandler; candidateHandler: CandidateHandler }
) => {
  const data = ctx.callbackQuery && "data" in ctx.callbackQuery ? ctx.callbackQuery.data : "";
  if (!data) return;

  let acknowledged = false;
  const acknowledge = async (text?: string) => {
    if (acknowledged) return;
    acknowledged = true;
    await ctx.answerCbQuery(text).catch(() => null);
  };
  let ackText: string | undefined;

  const safeDecode = (value: string): string => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  try {
    if (data === ACTIONS.CANDIDATE_VACANCIES || data === ACTIONS.BACK_VACANCIES) {
      await deps.candidateHandler.showVacancies(ctx);
      return;
    }
    if (data === ACTIONS.BACK_HOME) {
      await deps.candidateHandler.showHome(ctx);
      return;
    }
    if (data === ACTIONS.CANDIDATE_CANCEL) {
      await deps.candidateHandler.cancelFlow(ctx);
      return;
    }
    if (data === ACTIONS.CANDIDATE_BACK) {
      await deps.candidateHandler.backQuestion(ctx);
      return;
    }
    if (data === ACTIONS.CANDIDATE_SUBMIT) {
      await deps.candidateHandler.submit(ctx);
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.CANDIDATE_ANSWER)) {
      const value = safeDecode(data.replace(CALLBACK_PREFIX.CANDIDATE_ANSWER, ""));
      await deps.candidateHandler.answerFromCallback(ctx, value);
      return;
    }

    if (data === ACTIONS.ADMIN_MENU) {
      await deps.adminHandler.openAdminMenu(ctx);
      return;
    }
    if (data === ACTIONS.ADMIN_VACANCIES) {
      await deps.adminHandler.showVacancies(ctx);
      return;
    }
    if (data === ACTIONS.ADMIN_VACANCY_CREATE) {
      await deps.adminHandler.beginCreateVacancy(ctx);
      return;
    }
    if (data === ACTIONS.ADMIN_VACANCY_BACK) {
      const vacancyId = ctx.session.draftData?.adminSelectedVacancyId;
      if (vacancyId) {
        await deps.adminHandler.openVacancyCard(ctx, vacancyId);
        return;
      }
      await deps.adminHandler.showVacancies(ctx);
      return;
    }
    if (data === ACTIONS.ADMIN_SKIP) {
      await deps.adminHandler.skipPlaceholder(ctx);
      return;
    }
    if (data === ACTIONS.ADMIN_APPLICATIONS) {
      await deps.adminHandler.showApplications(ctx);
      return;
    }

    if (data.startsWith(CALLBACK_PREFIX.VACANCY_VIEW)) {
      const vacancyId = data.replace(CALLBACK_PREFIX.VACANCY_VIEW, "");
      await deps.candidateHandler.showVacancyDetails(ctx, vacancyId);
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.VACANCY_APPLY)) {
      const vacancyId = data.replace(CALLBACK_PREFIX.VACANCY_APPLY, "");
      await deps.candidateHandler.startApplication(ctx, vacancyId);
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.ADMIN_VACANCY_TOGGLE)) {
      const vacancyId = data.replace(CALLBACK_PREFIX.ADMIN_VACANCY_TOGGLE, "");
      await deps.adminHandler.toggleVacancy(ctx, vacancyId);
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.ADMIN_VACANCY_OPEN)) {
      const vacancyId = data.replace(CALLBACK_PREFIX.ADMIN_VACANCY_OPEN, "");
      await deps.adminHandler.openVacancyCard(ctx, vacancyId);
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.ADMIN_VACANCY_EDIT_TITLE)) {
      const vacancyId = data.replace(CALLBACK_PREFIX.ADMIN_VACANCY_EDIT_TITLE, "");
      await deps.adminHandler.beginEditVacancyTitle(ctx, vacancyId);
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.ADMIN_VACANCY_EDIT_SLUG)) {
      const vacancyId = data.replace(CALLBACK_PREFIX.ADMIN_VACANCY_EDIT_SLUG, "");
      await deps.adminHandler.beginEditVacancySlug(ctx, vacancyId);
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.ADMIN_VACANCY_EDIT_DESCRIPTION)) {
      const vacancyId = data.replace(CALLBACK_PREFIX.ADMIN_VACANCY_EDIT_DESCRIPTION, "");
      await deps.adminHandler.beginEditVacancyDescription(ctx, vacancyId);
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.ADMIN_VACANCY_DELETE_CONFIRM)) {
      const vacancyId = data.replace(CALLBACK_PREFIX.ADMIN_VACANCY_DELETE_CONFIRM, "");
      await deps.adminHandler.confirmDeleteVacancy(ctx, vacancyId);
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.ADMIN_VACANCY_DELETE)) {
      const vacancyId = data.replace(CALLBACK_PREFIX.ADMIN_VACANCY_DELETE, "");
      await deps.adminHandler.deleteVacancy(ctx, vacancyId);
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.ADMIN_QUESTION_ADD)) {
      const vacancyId = data.replace(CALLBACK_PREFIX.ADMIN_QUESTION_ADD, "");
      await deps.adminHandler.beginAddQuestion(ctx, vacancyId);
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.ADMIN_QUESTION_DELETE)) {
      const questionId = data.replace(CALLBACK_PREFIX.ADMIN_QUESTION_DELETE, "");
      await deps.adminHandler.deleteQuestion(ctx, questionId);
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.ADMIN_QUESTION_REORDER)) {
      const questionId = data.replace(CALLBACK_PREFIX.ADMIN_QUESTION_REORDER, "");
      await deps.adminHandler.beginReorderQuestion(ctx, questionId);
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.ADMIN_QUESTION_TYPE)) {
      const payload = data.replace(CALLBACK_PREFIX.ADMIN_QUESTION_TYPE, "");
      const [vacancyId, typeRaw] = payload.split(":");
      const allowed = ["TEXT", "NUMBER", "PHONE", "CHOICE", "YES_NO"] as const;
      if (allowed.includes(typeRaw as (typeof allowed)[number])) {
        await deps.adminHandler.setQuestionType(ctx, vacancyId, typeRaw as QuestionType);
      }
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.ADMIN_QUESTION_REQUIRED)) {
      const payload = data.replace(CALLBACK_PREFIX.ADMIN_QUESTION_REQUIRED, "");
      const [vacancyId, requiredRaw] = payload.split(":");
      await deps.adminHandler.setQuestionRequired(ctx, vacancyId, requiredRaw === "yes");
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.ADMIN_APPLICATION_VIEW)) {
      const applicationId = data.replace(CALLBACK_PREFIX.ADMIN_APPLICATION_VIEW, "");
      await deps.adminHandler.openApplication(ctx, applicationId);
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.ADMIN_ADD_NOTE)) {
      const applicationId = data.replace(CALLBACK_PREFIX.ADMIN_ADD_NOTE, "");
      await deps.adminHandler.beginAddNote(ctx, applicationId);
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.ADMIN_STATUS_SET)) {
      const payload = data.replace(CALLBACK_PREFIX.ADMIN_STATUS_SET, "");
      const [applicationId, statusRaw] = payload.split(":");
      const allowedStatuses = ["NEW", "CONTACTED", "INTERVIEW", "REJECTED", "HIRED"] as const;
      if (allowedStatuses.includes(statusRaw as (typeof allowedStatuses)[number])) {
        await deps.adminHandler.setStatus(ctx, applicationId, statusRaw as CandidateStatus);
        ackText = messages.callbackHandled;
      } else {
        ackText = messages.staleAction;
      }
      return;
    }
    if (data.startsWith(CALLBACK_PREFIX.PAGE)) {
      const pageAction = data.replace(CALLBACK_PREFIX.PAGE, "");
      if (pageAction === "admin-app-prev") {
        ctx.session = {
          ...ctx.session,
          draftData: {
            ...ctx.session.draftData,
            adminApplicationsPage: Math.max((ctx.session.draftData?.adminApplicationsPage ?? 0) - 1, 0)
          }
        };
      }
      if (pageAction === "admin-app-next") {
        ctx.session = {
          ...ctx.session,
          draftData: {
            ...ctx.session.draftData,
            adminApplicationsPage: (ctx.session.draftData?.adminApplicationsPage ?? 0) + 1
          }
        };
      }
      await deps.adminHandler.showApplications(ctx);
      return;
    }

    ackText = messages.staleAction;
  } catch (error) {
    if (error instanceof AppError) {
      ackText = toUserFriendlyError(error.message);
      return;
    }
    throw error;
  } finally {
    await acknowledge(ackText);
  }
};
