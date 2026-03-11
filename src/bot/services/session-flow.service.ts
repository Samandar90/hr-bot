import { SessionData } from "../../types/session.types";
import { BotContext } from "../../types/bot.types";
import { safeEditMessageText } from "../utils/safe-edit";
import { safeDeleteMessage } from "../utils/safe-delete";

export class SessionFlowService {
  resetFlowForStart(session: SessionData): SessionData {
    return {
      ...session,
      step: "home",
      mode: undefined,
      selectedVacancyId: undefined,
      currentQuestionIndex: 0,
      lastUserMessageId: undefined,
      draftData: {
        ...session.draftData,
        candidateDraft: undefined,
        adminPendingAction: null,
        adminSelectedApplicationId: undefined,
        adminApplicationsPage: 0,
        adminVacancyDraft: undefined,
        adminQuestionDraft: undefined,
        adminSelectedVacancyId: undefined,
        adminSelectedQuestionId: undefined
      },
      isCompleted: false
    };
  }

  async renderScreen(
    ctx: BotContext,
    session: SessionData,
    payload: {
      step: NonNullable<SessionData["step"]>;
      mode?: SessionData["mode"];
      text: string;
      extra?: Parameters<BotContext["reply"]>[1];
    }
  ): Promise<SessionData> {
    const { step, mode, text, extra } = payload;
    const messageId = session.currentScreenMessageId;

    if (messageId) {
      const edited = await safeEditMessageText(ctx, messageId, text, extra);
      if (edited) {
        return {
          ...session,
          mode: mode ?? session.mode,
          step
        };
      }

      await safeDeleteMessage(ctx, messageId);
    }

    const sent = await ctx.reply(text, extra);
    return {
      ...session,
      mode: mode ?? session.mode,
      step,
      currentScreenMessageId: sent.message_id
    };
  }
}
