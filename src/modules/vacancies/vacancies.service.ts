import { VacanciesRepository } from "./vacancies.repository";
import { AppError } from "../../common/errors/app-error";
import type { QuestionType } from "../../types/application.types";

export class VacanciesService {
  constructor(private readonly vacanciesRepository: VacanciesRepository) {}

  async getActiveVacancies() {
    return this.vacanciesRepository.listActive();
  }

  async getAllVacancies() {
    return this.vacanciesRepository.listAll();
  }

  async listVacanciesForAdmin() {
    return this.vacanciesRepository.listAll();
  }

  async getVacancyForCandidate(vacancyId: string) {
    const vacancy = await this.vacanciesRepository.getByIdWithQuestions(vacancyId);
    if (!vacancy || !vacancy.isActive) {
      throw new AppError("Vacancy not available", 404);
    }
    return vacancy;
  }

  async getVacancyForAdmin(vacancyId: string) {
    const vacancy = await this.vacanciesRepository.getByIdWithQuestions(vacancyId);
    if (!vacancy) {
      throw new AppError("Vacancy not found", 404);
    }
    return vacancy;
  }

  async toggleVacancy(vacancyId: string) {
    const vacancy = await this.getVacancyForAdmin(vacancyId);
    return this.vacanciesRepository.toggleActive(vacancyId, !vacancy.isActive);
  }

  async createVacancy(data: { title: string; slug: string; description: string }) {
    const existing = await this.vacanciesRepository.findBySlug(data.slug);
    if (existing) {
      throw new AppError("This slug is already used. Please choose another.", 400);
    }
    try {
      return await this.vacanciesRepository.createVacancy(data);
    } catch {
      throw new AppError("Vacancy slug must be unique", 400);
    }
  }

  async updateVacancy(
    vacancyId: string,
    data: Partial<{ title: string; slug: string; description: string; isActive: boolean }>
  ) {
    const current = await this.getVacancyForAdmin(vacancyId);
    if (data.slug && data.slug !== current.slug) {
      const existing = await this.vacanciesRepository.findBySlug(data.slug);
      if (existing && existing.id !== vacancyId) {
        throw new AppError("This slug is already used. Please choose another.", 400);
      }
    }
    try {
      return await this.vacanciesRepository.updateVacancy(vacancyId, data);
    } catch {
      throw new AppError("Could not update vacancy. Check slug uniqueness.", 400);
    }
  }

  async deleteVacancy(vacancyId: string) {
    await this.getVacancyForAdmin(vacancyId);
    try {
      return await this.vacanciesRepository.deleteVacancy(vacancyId);
    } catch {
      throw new AppError("Cannot delete vacancy with existing applications", 400);
    }
  }

  async createVacancyQuestion(data: {
    vacancyId: string;
    key: string;
    question: string;
    type: QuestionType;
    isRequired: boolean;
    placeholder?: string;
    optionsJson?: string[];
  }) {
    await this.getVacancyForAdmin(data.vacancyId);
    const existingKey = await this.vacanciesRepository.findQuestionByKey(data.vacancyId, data.key);
    if (existingKey) {
      throw new AppError("Question key already exists for this vacancy.", 400);
    }
    const order = await this.vacanciesRepository.getNextQuestionOrder(data.vacancyId);
    try {
      return await this.vacanciesRepository.createVacancyQuestion({
        ...data,
        type: data.type,
        order
      });
    } catch {
      throw new AppError("Could not create question. Key must be unique per vacancy.", 400);
    }
  }

  async deleteVacancyQuestion(questionId: string) {
    const question = await this.vacanciesRepository.getVacancyQuestionById(questionId);
    if (!question) throw new AppError("Question not found", 404);
    return this.vacanciesRepository.deleteVacancyQuestion(questionId);
  }

  async updateVacancyQuestionOrder(questionId: string, order: number) {
    const updated = await this.vacanciesRepository.updateVacancyQuestionOrder(questionId, order);
    if (!updated) throw new AppError("Question not found", 404);
    return updated;
  }
}
