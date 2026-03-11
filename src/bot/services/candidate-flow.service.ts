import { AppError } from "../../common/errors/app-error";
import { validateAnswerByType } from "../../common/validators/common.validators";
import {
  CandidateDraft,
  CandidateQuestionDraft,
  QuestionType
} from "../../types/application.types";
import { SessionData } from "../../types/session.types";
import { ApplicationsService } from "../../modules/applications/applications.service";
import { VacanciesService } from "../../modules/vacancies/vacancies.service";
import { NotifyService } from "./notify.service";

export class CandidateFlowService {
  constructor(
    private readonly vacanciesService: VacanciesService,
    private readonly applicationsService: ApplicationsService,
    private readonly notifyService: NotifyService
  ) {}

  async createDraftFromVacancy(vacancyId: string): Promise<CandidateDraft> {
    const vacancy = await this.vacanciesService.getVacancyForCandidate(vacancyId);
    if (!vacancy.questions.length) {
      throw new AppError("Vacancy has no configured questions", 400);
    }

    return {
      vacancyId: vacancy.id,
      vacancyTitle: vacancy.title,
      questions: vacancy.questions.map((q: (typeof vacancy.questions)[number]) => ({
        id: q.id,
        key: q.key,
        question: q.question,
        type: q.type,
        order: q.order,
        isRequired: q.isRequired,
        placeholder: q.placeholder ?? undefined,
        options: Array.isArray(q.optionsJson) ? (q.optionsJson as string[]) : undefined
      })),
      answers: []
    };
  }

  getDraft(session: SessionData): CandidateDraft | undefined {
    return session.draftData?.candidateDraft;
  }

  setDraft(session: SessionData, draft: CandidateDraft): SessionData {
    return {
      ...session,
      draftData: {
        ...session.draftData,
        candidateDraft: draft
      }
    };
  }

  clearDraft(session: SessionData): SessionData {
    return {
      ...session,
      selectedVacancyId: undefined,
      currentQuestionIndex: 0,
      isCompleted: false,
      draftData: {
        ...session.draftData,
        candidateDraft: undefined
      }
    };
  }

  getCurrentQuestion(session: SessionData): CandidateQuestionDraft | null {
    const draft = this.getDraft(session);
    if (!draft) return null;
    return draft.questions[session.currentQuestionIndex] ?? null;
  }

  applyAnswer(session: SessionData, rawText: string): SessionData {
    const draft = this.getDraft(session);
    if (!draft) {
      throw new AppError("No active application flow", 400);
    }

    const currentQuestion = this.getCurrentQuestion(session);
    if (!currentQuestion) {
      throw new AppError("Question not found", 400);
    }

    const value = validateAnswerByType(currentQuestion.type, rawText, currentQuestion.options);

    const nextAnswers = [
      ...draft.answers.filter((x) => x.questionId !== currentQuestion.id),
      {
        questionId: currentQuestion.id,
        key: currentQuestion.key,
        question: currentQuestion.question,
        type: currentQuestion.type,
        value
      }
    ];

    const isLast = session.currentQuestionIndex >= draft.questions.length - 1;
    const nextDraft: CandidateDraft = {
      ...draft,
      answers: nextAnswers
    };

    return {
      ...session,
      draftData: {
        ...session.draftData,
        candidateDraft: nextDraft
      },
      currentQuestionIndex: isLast ? session.currentQuestionIndex : session.currentQuestionIndex + 1
    };
  }

  hasCompletedQuestions(session: SessionData): boolean {
    const draft = this.getDraft(session);
    if (!draft) return false;
    return draft.answers.length >= draft.questions.length;
  }

  stepBack(session: SessionData): SessionData {
    const draft = this.getDraft(session);
    if (!draft) return session;
    return {
      ...session,
      currentQuestionIndex: Math.max(session.currentQuestionIndex - 1, 0)
    };
  }

  canAnswerByText(session: SessionData): boolean {
    const question = this.getCurrentQuestion(session);
    if (!question) return false;
    return (
      question.type === QuestionType.TEXT ||
      question.type === QuestionType.NUMBER ||
      question.type === QuestionType.PHONE
    );
  }

  async submit(params: {
    telegramId: bigint;
    fullName?: string;
    username?: string;
    session: SessionData;
  }) {
    const draft = this.getDraft(params.session);
    if (!draft) {
      throw new AppError("No active draft to submit", 400);
    }

    const application = await this.applicationsService.submitApplication({
      telegramId: params.telegramId,
      fullName: params.fullName,
      username: params.username,
      draft
    });

    await this.notifyService.notifyAdminNewApplication({
      applicationId: application.id,
      fullName: application.fullName,
      username: application.username,
      telegramId: application.telegramId,
      vacancyTitle: application.vacancy.title,
      phone: application.phone,
      status: application.status,
      answers: application.answers.map((answer: { question: { question: string }; answerText: string }) => ({
        question: answer.question.question,
        answer: answer.answerText
      }))
    });

    return application;
  }
}
