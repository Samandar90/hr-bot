import { AppError } from "../../common/errors/app-error";
import { CandidateDraft, CandidateStatus } from "../../types/application.types";
import { ApplicationsRepository } from "./applications.repository";

export class ApplicationsService {
  constructor(private readonly applicationsRepository: ApplicationsRepository) {}

  async submitApplication(params: {
    telegramId: bigint;
    fullName?: string;
    username?: string;
    draft: CandidateDraft;
  }) {
    if (!params.draft.answers.length) {
      throw new AppError("Application answers are empty", 400);
    }
    if (params.draft.answers.length < params.draft.questions.length) {
      throw new AppError("Application is incomplete", 400);
    }
    const existing = await this.applicationsRepository.findExistingByTelegramAndVacancy(
      params.telegramId,
      params.draft.vacancyId
    );
    if (existing) {
      throw new AppError("You have already applied for this vacancy.", 409);
    }

    return this.applicationsRepository.createFromDraft(params);
  }

  async listApplications(page: number, pageSize: number) {
    return this.applicationsRepository.listApplications(page, pageSize);
  }

  async getApplicationCard(applicationId: string) {
    const application = await this.applicationsRepository.getApplicationById(applicationId);
    if (!application) {
      throw new AppError("Application not found", 404);
    }
    return application;
  }

  async setStatus(applicationId: string, status: CandidateStatus, changedBy: bigint) {
    const updated = await this.applicationsRepository.updateStatus(
      applicationId,
      status,
      changedBy
    );
    if (!updated) {
      throw new AppError("Application not found", 404);
    }
    return updated;
  }
}
