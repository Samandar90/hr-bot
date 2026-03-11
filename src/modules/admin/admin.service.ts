import { prisma } from "../../db/prisma";
import { env } from "../../config/env";

export class AdminService {
  isAdmin(telegramId: bigint): boolean {
    return telegramId === env.ADMIN_TELEGRAM_ID;
  }

  async ensureAdminUserExists() {
    await prisma.adminUser.upsert({
      where: { telegramId: env.ADMIN_TELEGRAM_ID },
      create: { telegramId: env.ADMIN_TELEGRAM_ID },
      update: {}
    });
  }
}
