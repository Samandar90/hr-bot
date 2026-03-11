import { SessionsRepository } from "./sessions.repository";
import { SessionData } from "../../types/session.types";

export class SessionsService {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async getSession(telegramId: bigint): Promise<SessionData> {
    return (
      (await this.sessionsRepository.getByTelegramId(telegramId)) ?? {
        currentQuestionIndex: 0,
        isCompleted: false
      }
    );
  }

  async saveSession(telegramId: bigint, session: SessionData): Promise<void> {
    await this.sessionsRepository.upsertByTelegramId(telegramId, session);
  }

  async clearDraft(telegramId: bigint, session: SessionData): Promise<SessionData> {
    const next: SessionData = {
      ...session,
      selectedVacancyId: undefined,
      currentQuestionIndex: 0,
      draftData: {
        ...session.draftData,
        candidateDraft: undefined
      },
      isCompleted: false
    };
    await this.saveSession(telegramId, next);
    return next;
  }
}
