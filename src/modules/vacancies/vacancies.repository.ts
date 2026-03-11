import { prisma } from "../../db/prisma";
import type { Prisma } from "@prisma/client";

export class VacanciesRepository {
  async listActive() {
    return prisma.vacancy.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async listAll() {
    return prisma.vacancy.findMany({
      orderBy: { createdAt: "desc" }
    });
  }

  async findBySlug(slug: string) {
    return prisma.vacancy.findUnique({
      where: { slug }
    });
  }

  async createVacancy(data: { title: string; slug: string; description: string }) {
    return prisma.vacancy.create({
      data
    });
  }

  async updateVacancy(
    vacancyId: string,
    data: Partial<{ title: string; slug: string; description: string; isActive: boolean }>
  ) {
    return prisma.vacancy.update({
      where: { id: vacancyId },
      data
    });
  }

  async deleteVacancy(vacancyId: string) {
    return prisma.vacancy.delete({
      where: { id: vacancyId }
    });
  }

  async getByIdWithQuestions(vacancyId: string) {
    return prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: {
        questions: {
          orderBy: { order: "asc" }
        }
      }
    });
  }

  async toggleActive(vacancyId: string, isActive: boolean) {
    return prisma.vacancy.update({
      where: { id: vacancyId },
      data: { isActive }
    });
  }

  async createVacancyQuestion(data: {
    vacancyId: string;
    order: number;
    key: string;
    question: string;
    type: "TEXT" | "NUMBER" | "PHONE" | "CHOICE" | "YES_NO";
    isRequired: boolean;
    placeholder?: string;
    optionsJson?: string[];
  }) {
    return prisma.vacancyQuestion.create({
      data
    });
  }

  async deleteVacancyQuestion(questionId: string) {
    return prisma.vacancyQuestion.delete({
      where: { id: questionId }
    });
  }

  async getVacancyQuestionById(questionId: string) {
    return prisma.vacancyQuestion.findUnique({
      where: { id: questionId }
    });
  }

  async findQuestionByKey(vacancyId: string, key: string) {
    return prisma.vacancyQuestion.findFirst({
      where: {
        vacancyId,
        key
      }
    });
  }

  async getQuestionByOrder(vacancyId: string, order: number) {
    return prisma.vacancyQuestion.findFirst({
      where: {
        vacancyId,
        order
      }
    });
  }

  async setQuestionOrder(questionId: string, order: number) {
    return prisma.vacancyQuestion.update({
      where: { id: questionId },
      data: { order }
    });
  }

  async getNextQuestionOrder(vacancyId: string): Promise<number> {
    const last = await prisma.vacancyQuestion.findFirst({
      where: { vacancyId },
      orderBy: { order: "desc" },
      select: { order: true }
    });
    return (last?.order ?? 0) + 1;
  }

  async updateVacancyQuestionOrder(questionId: string, newOrder: number) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const current = await tx.vacancyQuestion.findUnique({
        where: { id: questionId }
      });
      if (!current) return null;
      if (current.order === newOrder) return current;

      const existingTarget = await tx.vacancyQuestion.findFirst({
        where: {
          vacancyId: current.vacancyId,
          order: newOrder
        }
      });

      await tx.vacancyQuestion.update({
        where: { id: current.id },
        data: { order: -1 }
      });

      if (existingTarget) {
        await tx.vacancyQuestion.update({
          where: { id: existingTarget.id },
          data: { order: current.order }
        });
      }

      return tx.vacancyQuestion.update({
        where: { id: current.id },
        data: { order: newOrder }
      });
    });
  }
}
