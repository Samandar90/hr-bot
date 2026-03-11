import { BotContext } from "../../types/bot.types";
import { ChatCleanerService } from "../services/chat-cleaner.service";
import { CandidateFlowService } from "../services/candidate-flow.service";
import { SessionFlowService } from "../services/session-flow.service";
import { keyboards } from "../ui/keyboards";
import { messages, withValidationHint } from "../ui/messages";
import { screens } from "../ui/screens";
import { CandidateHandler } from "./candidate.handler";
import { AdminHandler } from "./admin.handler";
import { AppError } from "../../common/errors/app-error";
import { toUserFriendlyError } from "../utils/telegram";

export const handleTextMessage = async (
  ctx: BotContext,
  deps: {
    chatCleanerService: ChatCleanerService;
    candidateFlowService: CandidateFlowService;
    sessionFlowService: SessionFlowService;
    candidateHandler: CandidateHandler;
    adminHandler: AdminHandler;
  }
) => {
  const text = ctx.message && "text" in ctx.message ? ctx.message.text : "";
  if (!text) return;
  ctx.session = deps.chatCleanerService.rememberIncomingUserMessage(ctx, ctx.session);

  const isAdminUser = deps.adminHandler.isAdminUser(ctx.from?.id ?? 0);
  const shouldRouteToAdmin = isAdminUser || ctx.session.mode === "admin";
  if (shouldRouteToAdmin) {
    try {
      const adminHandled = await deps.adminHandler.handleTextInput(ctx, text.trim());
      if (adminHandled) {
        ctx.session = await deps.chatCleanerService.deleteLastUserMessage(ctx, ctx.session);
        return;
      }
    } catch (error) {
      const step = ctx.session.step;
      if (error instanceof AppError && ctx.session.mode === "admin" && step) {
        ctx.session = await deps.chatCleanerService.deleteLastUserMessage(ctx, ctx.session);
        await deps.adminHandler.recoverAdminStep(ctx, step, toUserFriendlyError(error.message));
        return;
      }
      throw error;
    }
  }

  if (!deps.candidateFlowService.getDraft(ctx.session)) return;
  if (!deps.candidateFlowService.canAnswerByText(ctx.session)) {
    ctx.session = await deps.chatCleanerService.deleteLastUserMessage(ctx, ctx.session);
    const draft = deps.candidateFlowService.getDraft(ctx.session);
    const question = deps.candidateFlowService.getCurrentQuestion(ctx.session);
    if (draft && question) {
      ctx.session = await deps.sessionFlowService.renderScreen(ctx, ctx.session, {
        mode: "candidate",
        step: "candidate_question",
        text: withValidationHint(
          "Iltimos, ushbu savol uchun ekrandagi tugmalardan foydalaning.",
          screens.candidateQuestion(draft, ctx.session.currentQuestionIndex)
        ),
        extra: keyboards.candidateQuestion(question, ctx.session.currentQuestionIndex > 0)
      });
    }
    return;
  }

  try {
    ctx.session = deps.candidateFlowService.applyAnswer(ctx.session, text);
    ctx.session = await deps.chatCleanerService.deleteLastUserMessage(ctx, ctx.session);
    await deps.candidateHandler.renderCurrentQuestion(ctx);
  } catch (error) {
    ctx.session = await deps.chatCleanerService.deleteLastUserMessage(ctx, ctx.session);
    if (error instanceof AppError) {
      const draft = deps.candidateFlowService.getDraft(ctx.session);
      const question = deps.candidateFlowService.getCurrentQuestion(ctx.session);
      if (draft && question) {
        ctx.session = await deps.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "candidate",
          step: "candidate_question",
          text: withValidationHint(
            toUserFriendlyError(error.message),
            screens.candidateQuestion(draft, ctx.session.currentQuestionIndex)
          ),
          extra: keyboards.candidateQuestion(question, ctx.session.currentQuestionIndex > 0)
        });
        return;
      }
      await ctx.reply(toUserFriendlyError(error.message));
      return;
    }
    await ctx.reply(messages.inputRequired);
  }
};
