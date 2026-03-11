import { Context } from "telegraf";
import { SessionData } from "./session.types";

export type BotContext = Context & {
  session: SessionData;
};
