import { BotContext } from "../../types/bot.types";
import { SessionData } from "../../types/session.types";
import { safeDeleteMessage } from "../utils/safe-delete";

export class ChatCleanerService {
  rememberIncomingUserMessage(ctx: BotContext, session: SessionData): SessionData {
    const message = ctx.message as { message_id?: number } | undefined;
    const messageId = message?.message_id;
    if (!messageId) return session;
    return {
      ...session,
      lastUserMessageId: messageId
    };
  }

  async deleteLastUserMessage(ctx: BotContext, session: SessionData): Promise<SessionData> {
    const messageId = session.lastUserMessageId;
    if (!messageId) return session;

    await safeDeleteMessage(ctx, messageId);
    return {
      ...session,
      lastUserMessageId: undefined
    };
  }
}
