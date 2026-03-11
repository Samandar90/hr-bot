import { createApp } from "./app";
import { createBot } from "./bot/bot";
import { env } from "./config/env";
import { prisma } from "./db/prisma";

const start = async () => {
  const app = createApp();
  const { bot, adminService } = createBot();

  const server = app.listen(env.PORT, () => {
    console.log(`HTTP server running on port ${env.PORT}`);
  });

  try {
    await adminService.ensureAdminUserExists();
    await bot.launch();
    console.log("Telegram bot started");
  } catch (error) {
    console.error("Failed to start bot:", error);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(1);
    });
    return;
  }

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down...`);
    await bot.stop(signal);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
};

void start();