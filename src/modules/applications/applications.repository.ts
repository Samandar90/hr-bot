import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { CandidateDraft, CandidateStatus } from "../../types/application.types";

export class ApplicationsRepository {
  async findExistingByTelegramAndVacancy(telegramId: bigint, vacancyId: string) {
    return prisma.application.findFirst({
      where: {
        telegramId,
        vacancyId
      },
      select: { id: true }
    });
  }

  async createFromDraft(params: {
    telegramId: bigint;
    fullName?: string;
    username?: string;
    draft: CandidateDraft;
  }) {
    const { telegramId, fullName, username, draft } = params;
    const mappedFullName =
      draft.answers.find((x) => x.key.toLowerCase() === "full_name")?.value ?? fullName;
    const mappedPhone = draft.answers.find((x) => x.key.toLowerCase() === "phone")?.value;

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const application = await tx.application.create({
        data: {
          telegramId,
          fullName: mappedFullName,
          username,
          phone: mappedPhone ?? draft.answers.find((x) => x.type === "PHONE")?.value,
          vacancyId: draft.vacancyId
        }
      });

      if (draft.answers.length > 0) {
        await tx.applicationAnswer.createMany({
          data: draft.answers.map((answer) => ({
            applicationId: application.id,
            questionId: answer.questionId,
            answerText: answer.value
          }))
        });
      }

      await tx.applicationStatusLog.create({
        data: {
          applicationId: application.id,
          fromStatus: "NEW",
          toStatus: "NEW",
          changedBy: telegramId
        }
      });

      const created = await tx.application.findUnique({
        where: { id: application.id },
        include: {
          vacancy: true,
          answers: {
            include: {
              question: true
            },
            orderBy: {
              question: {
                order: "asc"
              }
            }
          }
        }
      });

      // Application was just created in the same transaction; this is a defensive fallback.
      return (
        created ??
        (await tx.application.findUniqueOrThrow({
          where: { id: application.id },
          include: {
            vacancy: true,
            answers: {
              include: {
                question: true
              }
            }
          }
        }))
      );
    });
  }

  async listApplications(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.application.findMany({
        skip: page * pageSize,
        take: pageSize,
        orderBy: { submittedAt: "desc" },
        include: { vacancy: true }
      }),
      prisma.application.count()
    ]);

    return { items, total };
  }

  async getApplicationById(applicationId: string) {
    return prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        vacancy: true,
        answers: {
          include: {
            question: true
          }
        },
        notes: {
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    });
  }

  async updateStatus(
    applicationId: string,
    status: CandidateStatus,
    changedBy: bigint
  ) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const current = await tx.application.findUnique({ where: { id: applicationId } });
      if (!current) {
        return null;
      }

      const updated = await tx.application.update({
        where: { id: applicationId },
        data: { status }
      });

      await tx.applicationStatusLog.create({
        data: {
          applicationId,
          fromStatus: current.status,
          toStatus: status,
          changedBy
        }
      });

      return updated;
    });
  }
}
