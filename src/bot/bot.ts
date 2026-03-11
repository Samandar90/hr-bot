import { Telegraf } from "telegraf";
import { BotContext } from "../types/bot.types";
import { registerHandlers } from "./register-handlers";
import { SessionsRepository } from "../modules/sessions/sessions.repository";
import { SessionsService } from "../modules/sessions/sessions.service";
import { VacanciesRepository } from "../modules/vacancies/vacancies.repository";
import { VacanciesService } from "../modules/vacancies/vacancies.service";
import { ApplicationsRepository } from "../modules/applications/applications.repository";
import { ApplicationsService } from "../modules/applications/applications.service";
import { NotesRepository } from "../modules/notes/notes.repository";
import { NotesService } from "../modules/notes/notes.service";
import { AdminService } from "../modules/admin/admin.service";
import { SessionFlowService } from "./services/session-flow.service";
import { ChatCleanerService } from "./services/chat-cleaner.service";
import { NotifyService } from "./services/notify.service";
import { CandidateFlowService } from "./services/candidate-flow.service";
import { AdminFlowService } from "./services/admin-flow.service";
import { AdminHandler } from "./handlers/admin.handler";
import { CandidateHandler } from "./handlers/candidate.handler";
import { env } from "../config/env";

export const createBot = () => {
  const bot = new Telegraf<BotContext>(env.TELEGRAM_BOT_TOKEN);

  const sessionsService = new SessionsService(new SessionsRepository());
  const vacanciesService = new VacanciesService(new VacanciesRepository());
  const applicationsService = new ApplicationsService(new ApplicationsRepository());
  const notesService = new NotesService(new NotesRepository());
  const adminService = new AdminService();
  const sessionFlowService = new SessionFlowService();
  const chatCleanerService = new ChatCleanerService();
  const notifyService = new NotifyService(bot);
  const candidateFlowService = new CandidateFlowService(
    vacanciesService,
    applicationsService,
    notifyService
  );
  const adminFlowService = new AdminFlowService(vacanciesService, applicationsService, notesService);

  const adminHandler = new AdminHandler(adminService, adminFlowService, sessionFlowService);
  const candidateHandler = new CandidateHandler(
    vacanciesService,
    candidateFlowService,
    sessionFlowService
  );

  bot.use(async (ctx, next) => {
    if (!ctx.from) {
      await next();
      return;
    }

    const telegramId = BigInt(ctx.from.id);
    ctx.session = await sessionsService.getSession(telegramId);
    await next();
    await sessionsService.saveSession(telegramId, ctx.session ?? {});
  });

  registerHandlers(bot, {
    adminService,
    adminHandler,
    candidateHandler,
    sessionFlowService,
    candidateFlowService,
    chatCleanerService
  });

  return { bot, adminService };
};
