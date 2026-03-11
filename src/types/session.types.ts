import type { CandidateStatus } from "./application.types";
import type { AdminQuestionDraft, AdminVacancyDraft, CandidateDraft } from "./application.types";

export type SessionMode = "candidate" | "admin";

export type SessionStep =
  | "home"
  | "candidate_vacancies"
  | "candidate_vacancy_details"
  | "candidate_question"
  | "candidate_confirm"
  | "candidate_submitted"
  | "admin_menu"
  | "admin_vacancies"
  | "admin_vacancy_card"
  | "admin_vacancy_create_title"
  | "admin_vacancy_create_slug"
  | "admin_vacancy_create_description"
  | "admin_vacancy_edit_title"
  | "admin_vacancy_edit_slug"
  | "admin_vacancy_edit_description"
  | "admin_vacancy_delete_confirm"
  | "admin_question_create_key"
  | "admin_question_create_text"
  | "admin_question_create_type"
  | "admin_question_create_required"
  | "admin_question_create_placeholder"
  | "admin_question_create_options"
  | "admin_question_order_input"
  | "admin_applications"
  | "admin_application_card"
  | "admin_note_input";

export type PendingAdminAction =
  | {
      type: "add_note";
      applicationId: string;
    }
  | {
      type: "vacancy_edit_title";
      vacancyId: string;
    }
  | {
      type: "vacancy_edit_slug";
      vacancyId: string;
    }
  | {
      type: "vacancy_edit_description";
      vacancyId: string;
    }
  | {
      type: "question_reorder";
      vacancyId: string;
      questionId: string;
    }
  | null;

export type SessionDraftData = {
  candidateDraft?: CandidateDraft;
  adminSelectedApplicationId?: string;
  adminPendingAction?: PendingAdminAction;
  adminApplicationsPage?: number;
  adminVacancyDraft?: AdminVacancyDraft;
  adminQuestionDraft?: AdminQuestionDraft;
  adminSelectedVacancyId?: string;
  adminSelectedQuestionId?: string;
};

export type SessionData = {
  mode?: SessionMode;
  step?: SessionStep;
  selectedVacancyId?: string;
  currentQuestionIndex: number;
  currentScreenMessageId?: number;
  lastUserMessageId?: number;
  draftData?: SessionDraftData;
  isCompleted: boolean;
  lastKnownStatus?: CandidateStatus;
};
