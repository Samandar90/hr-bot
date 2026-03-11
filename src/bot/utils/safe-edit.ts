import { BotContext } from "../../types/bot.types";

export const safeEditMessageText = async (
  ctx: BotContext,
  messageId: number,
  text: string,
  extra?: Parameters<BotContext["reply"]>[1]
): Promise<boolean> => {
  if (!ctx.chat?.id) return false;
  try {
    await ctx.telegram.editMessageText(ctx.chat!.id, messageId, undefined, text, extra as never);
    return true;
  } catch {
    return false;
  }
};
