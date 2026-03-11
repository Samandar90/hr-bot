import { CandidateStatus, QuestionType } from "@prisma/client";

export { CandidateStatus, QuestionType };

export type CandidateQuestionDraft = {
  id: string;
  key: string;
  question: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  placeholder?: string;
  options?: string[];
};

export type CandidateAnswerDraft = {
  questionId: string;
  key: string;
  question: string;
  type: QuestionType;
  value: string;
};

export type CandidateDraft = {
  vacancyId: string;
  vacancyTitle: string;
  questions: CandidateQuestionDraft[];
  answers: CandidateAnswerDraft[];
};

export type AdminVacancyDraft = {
  title?: string;
  slug?: string;
  description?: string;
};

export type AdminQuestionDraft = {
  vacancyId: string;
  key?: string;
  question?: string;
  type?: QuestionType;
  isRequired?: boolean;
  placeholder?: string;
  options?: string[];
};

export type ApplicationCard = {
  id: string;
  vacancyTitle: string;
  candidateLabel: string;
  status: CandidateStatus;
  submittedAt: Date;
};
