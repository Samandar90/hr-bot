import { prisma } from "../../db/prisma";
import { SessionData } from "../../types/session.types";

export class SessionsRepository {
  async getByTelegramId(telegramId: bigint): Promise<SessionData | null> {
    const record = await prisma.candidateSession.findUnique({
      where: { telegramId }
    });
    if (!record) return null;
    return {
      mode: (record.mode ?? undefined) as SessionData["mode"],
      step: (record.step ?? undefined) as SessionData["step"],
      selectedVacancyId: record.selectedVacancyId ?? undefined,
      currentQuestionIndex: record.currentQuestionIndex,
      currentScreenMessageId: record.currentScreenMessageId ?? undefined,
      lastUserMessageId: record.lastUserMessageId ?? undefined,
      draftData: (record.draftData as SessionData["draftData"]) ?? undefined,
      isCompleted: record.isCompleted
    };
  }

  async upsertByTelegramId(telegramId: bigint, data: SessionData): Promise<void> {
    await prisma.candidateSession.upsert({
      where: { telegramId },
      create: {
        telegramId,
        mode: data.mode ?? null,
        step: data.step ?? null,
        selectedVacancyId: data.selectedVacancyId ?? null,
        currentQuestionIndex: data.currentQuestionIndex,
        currentScreenMessageId: data.currentScreenMessageId ?? null,
        lastUserMessageId: data.lastUserMessageId ?? null,
        draftData: data.draftData ?? undefined,
        isCompleted: data.isCompleted
      },
      update: {
        mode: data.mode ?? null,
        step: data.step ?? null,
        selectedVacancyId: data.selectedVacancyId ?? null,
        currentQuestionIndex: data.currentQuestionIndex,
        currentScreenMessageId: data.currentScreenMessageId ?? null,
        lastUserMessageId: data.lastUserMessageId ?? null,
        draftData: data.draftData ?? undefined,
        isCompleted: data.isCompleted
      }
    });
  }
}
