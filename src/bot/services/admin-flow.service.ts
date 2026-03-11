import { CandidateStatus } from "@prisma/client";
import { DEFAULT_PAGE_SIZE } from "../../config/constants";
import { ApplicationsService } from "../../modules/applications/applications.service";
import { NotesService } from "../../modules/notes/notes.service";
import { VacanciesService } from "../../modules/vacancies/vacancies.service";

export class AdminFlowService {
  constructor(
    private readonly vacanciesService: VacanciesService,
    private readonly applicationsService: ApplicationsService,
    private readonly notesService: NotesService
  ) {}

  async getVacancies() {
    return this.vacanciesService.listVacanciesForAdmin();
  }

  async toggleVacancy(vacancyId: string) {
    return this.vacanciesService.toggleVacancy(vacancyId);
  }

  async getVacancy(vacancyId: string) {
    return this.vacanciesService.getVacancyForAdmin(vacancyId);
  }

  async createVacancy(data: { title: string; slug: string; description: string }) {
    return this.vacanciesService.createVacancy(data);
  }

  async updateVacancy(
    vacancyId: string,
    data: Partial<{ title: string; slug: string; description: string; isActive: boolean }>
  ) {
    return this.vacanciesService.updateVacancy(vacancyId, data);
  }

  async deleteVacancy(vacancyId: string) {
    return this.vacanciesService.deleteVacancy(vacancyId);
  }

  async createQuestion(data: {
    vacancyId: string;
    key: string;
    question: string;
    type: "TEXT" | "NUMBER" | "PHONE" | "CHOICE" | "YES_NO";
    isRequired: boolean;
    placeholder?: string;
    optionsJson?: string[];
  }) {
    return this.vacanciesService.createVacancyQuestion(data);
  }

  async deleteQuestion(questionId: string) {
    return this.vacanciesService.deleteVacancyQuestion(questionId);
  }

  async reorderQuestion(questionId: string, order: number) {
    return this.vacanciesService.updateVacancyQuestionOrder(questionId, order);
  }

  async getApplications(page: number) {
    return this.applicationsService.listApplications(page, DEFAULT_PAGE_SIZE);
  }

  async getApplication(applicationId: string) {
    return this.applicationsService.getApplicationCard(applicationId);
  }

  async setApplicationStatus(
    applicationId: string,
    status: CandidateStatus,
    adminTelegramId: bigint
  ) {
    return this.applicationsService.setStatus(applicationId, status, adminTelegramId);
  }

  async addInternalNote(applicationId: string, note: string, adminTelegramId: bigint) {
    return this.notesService.addNote(applicationId, note, adminTelegramId);
  }
}
