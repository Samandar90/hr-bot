import { Telegraf } from "telegraf";
import { BotContext } from "../types/bot.types";
import { AppError } from "../common/errors/app-error";
import { messages } from "./ui/messages";
import { handleStartCommand } from "./handlers/start.handler";
import { handleCallbackQuery } from "./handlers/callback.handler";
import { handleTextMessage } from "./handlers/text.handler";
import { AdminHandler } from "./handlers/admin.handler";
import { CandidateHandler } from "./handlers/candidate.handler";
import { AdminService } from "../modules/admin/admin.service";
import { SessionFlowService } from "./services/session-flow.service";
import { CandidateFlowService } from "./services/candidate-flow.service";
import { ChatCleanerService } from "./services/chat-cleaner.service";
import { toUserFriendlyError } from "./utils/telegram";

type RegisterDeps = {
  adminService: AdminService;
  adminHandler: AdminHandler;
  candidateHandler: CandidateHandler;
  sessionFlowService: SessionFlowService;
  candidateFlowService: CandidateFlowService;
  chatCleanerService: ChatCleanerService;
};

export const registerHandlers = (bot: Telegraf<BotContext>, deps: RegisterDeps) => {
  bot.start(async (ctx) => {
    try {
      await handleStartCommand(ctx, {
        adminService: deps.adminService,
        sessionFlowService: deps.sessionFlowService
      });
    } catch (error) {
      await handleBotError(ctx, error);
    }
  });

  bot.command("admin", async (ctx) => {
    try {
      await deps.adminHandler.openAdminMenu(ctx);
    } catch (error) {
      await handleBotError(ctx, error);
    }
  });

  bot.on("callback_query", async (ctx) => {
    try {
      await handleCallbackQuery(ctx, {
        adminHandler: deps.adminHandler,
        candidateHandler: deps.candidateHandler
      });
    } catch (error) {
      await handleBotError(ctx, error);
    }
  });

  bot.on("text", async (ctx) => {
    try {
      await handleTextMessage(ctx, {
        chatCleanerService: deps.chatCleanerService,
        candidateFlowService: deps.candidateFlowService,
        sessionFlowService: deps.sessionFlowService,
        candidateHandler: deps.candidateHandler,
        adminHandler: deps.adminHandler
      });
    } catch (error) {
      await handleBotError(ctx, error);
    }
  });
};

const handleBotError = async (ctx: BotContext, error: unknown) => {
  if (error instanceof AppError) {
    const message = toUserFriendlyError(error.message);
    await ctx.answerCbQuery(message).catch(() => null);
    await ctx.reply(message);
    return;
  }
  await ctx.answerCbQuery(messages.internalError).catch(() => null);
  await ctx.reply(messages.internalError);
};
