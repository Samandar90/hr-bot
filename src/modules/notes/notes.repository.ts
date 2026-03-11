import { prisma } from "../../db/prisma";

export class NotesRepository {
  async addNote(applicationId: string, note: string, adminTelegram: bigint) {
    return prisma.applicationNote.create({
      data: {
        applicationId,
        note,
        adminTelegram
      }
    });
  }
}
