import { BotContext } from "../../types/bot.types";

export const safeDeleteMessage = async (ctx: BotContext, messageId: number): Promise<boolean> => {
  if (!ctx.chat?.id) return false;
  try {
    await ctx.telegram.deleteMessage(ctx.chat!.id, messageId);
    return true;
  } catch {
    return false;
  }
};
