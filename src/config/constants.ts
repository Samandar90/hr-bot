export const CALLBACK_PREFIX = {
  VACANCY_VIEW: "vac:view:",
  VACANCY_APPLY: "vac:apply:",
  CANDIDATE_ANSWER: "candidate:answer:",
  ADMIN_VACANCY_OPEN: "adm:vac:open:",
  ADMIN_VACANCY_EDIT_TITLE: "adm:vac:edit:title:",
  ADMIN_VACANCY_EDIT_SLUG: "adm:vac:edit:slug:",
  ADMIN_VACANCY_EDIT_DESCRIPTION: "adm:vac:edit:desc:",
  ADMIN_VACANCY_TOGGLE: "adm:vac:toggle:",
  ADMIN_VACANCY_DELETE_CONFIRM: "adm:vac:del:confirm:",
  ADMIN_VACANCY_DELETE: "adm:vac:del:",
  ADMIN_QUESTION_ADD: "adm:q:add:",
  ADMIN_QUESTION_DELETE: "adm:q:del:",
  ADMIN_QUESTION_REORDER: "adm:q:reorder:",
  ADMIN_QUESTION_TYPE: "adm:q:type:",
  ADMIN_QUESTION_REQUIRED: "adm:q:req:",
  ADMIN_APPLICATION_VIEW: "adm:app:view:",
  ADMIN_STATUS_SET: "adm:app:status:",
  ADMIN_ADD_NOTE: "adm:app:note:",
  PAGE: "page:"
} as const;

export const ACTIONS = {
  CANDIDATE_VACANCIES: "candidate:vacancies",
  CANDIDATE_CONFIRM_SUBMIT: "candidate:confirm-submit",
  CANDIDATE_SUBMIT: "candidate:submit",
  CANDIDATE_BACK: "candidate:back",
  CANDIDATE_CANCEL: "candidate:cancel",
  ADMIN_MENU: "admin:menu",
  ADMIN_VACANCIES: "admin:vacancies",
  ADMIN_VACANCY_CREATE: "admin:vacancy:create",
  ADMIN_VACANCY_BACK: "admin:vacancy:back",
  ADMIN_SKIP: "admin:skip",
  ADMIN_APPLICATIONS: "admin:applications",
  BACK_HOME: "back:home",
  BACK_VACANCIES: "back:vacancies"
} as const;

export const DEFAULT_PAGE_SIZE = 8;
