import { Markup } from "telegraf";
import { ACTIONS } from "../../config/constants";
import { BotContext } from "../../types/bot.types";
import { messages } from "../ui/messages";
import { AdminService } from "../../modules/admin/admin.service";
import { SessionFlowService } from "../services/session-flow.service";

export const handleStartCommand = async (
  ctx: BotContext,
  deps: { adminService: AdminService; sessionFlowService: SessionFlowService }
) => {
  const hadActiveFlow = Boolean(ctx.session.step && ctx.session.step !== "home");
  ctx.session = deps.sessionFlowService.resetFlowForStart(ctx.session);
  const telegramId = BigInt(ctx.from?.id ?? 0);
  const isAdmin = deps.adminService.isAdmin(telegramId);

  const baseWelcome = messages.welcome(ctx.from?.first_name);
  const resetPrefix = hadActiveFlow ? `${messages.flowReset}\n\n` : "";
  const text = isAdmin
    ? `${resetPrefix}${baseWelcome}\n\n⚙️ Siz admin sifatida tizimga kirdingiz.`
    : `${resetPrefix}${baseWelcome}`;

  const keyboard = isAdmin
    ? Markup.inlineKeyboard([
        [Markup.button.callback("⚙️ Admin panelni ochish", ACTIONS.ADMIN_MENU)],
        [Markup.button.callback("💼 Vakansiyalarni ko'rish", ACTIONS.CANDIDATE_VACANCIES)]
      ])
    : Markup.inlineKeyboard([[Markup.button.callback("💼 Vakansiyalarni ko'rish", ACTIONS.CANDIDATE_VACANCIES)]]);

  ctx.session = await deps.sessionFlowService.renderScreen(ctx, ctx.session, {
    mode: "candidate",
    step: "home",
    text,
    extra: keyboard
  });
};
