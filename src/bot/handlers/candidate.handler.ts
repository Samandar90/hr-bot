import { Markup } from "telegraf";
import { ACTIONS } from "../../config/constants";
import { BotContext } from "../../types/bot.types";
import { CandidateFlowService } from "../services/candidate-flow.service";
import { SessionFlowService } from "../services/session-flow.service";
import { VacanciesService } from "../../modules/vacancies/vacancies.service";
import { keyboards } from "../ui/keyboards";
import { messages } from "../ui/messages";
import { screens } from "../ui/screens";
import { getTelegramId, toUserFriendlyError } from "../utils/telegram";

export class CandidateHandler {
  constructor(
    private readonly vacanciesService: VacanciesService,
    private readonly candidateFlowService: CandidateFlowService,
    private readonly sessionFlowService: SessionFlowService
  ) {}

  async showVacancies(ctx: BotContext) {
    const vacancies = await this.vacanciesService.getActiveVacancies();
    if (!vacancies.length) {
      ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
        mode: "candidate",
        step: "candidate_vacancies",
        text: messages.emptyVacancies,
        extra: Markup.inlineKeyboard([[Markup.button.callback("🏠 Bosh sahifa", ACTIONS.BACK_HOME)]])
      });
      return;
    }

    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "candidate",
      step: "candidate_vacancies",
      text: messages.pickVacancy,
      extra: keyboards.vacancyList(
        vacancies.map((v: { id: string; title: string }) => ({ id: v.id, title: v.title }))
      )
    });
  }

  async showVacancyDetails(ctx: BotContext, vacancyId: string) {
    const vacancy = await this.vacanciesService.getVacancyForCandidate(vacancyId);
    ctx.session = {
      ...ctx.session,
      selectedVacancyId: vacancyId
    };
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "candidate",
      step: "candidate_vacancy_details",
      text: screens.vacancyDetails(vacancy),
      extra: {
        parse_mode: "Markdown",
        ...keyboards.vacancyDetails(vacancyId)
      }
    });
  }

  async startApplication(ctx: BotContext, vacancyId: string) {
    const draft = await this.candidateFlowService.createDraftFromVacancy(vacancyId);
    ctx.session = this.candidateFlowService.setDraft(ctx.session, draft);
    ctx.session = {
      ...ctx.session,
      mode: "candidate",
      step: "candidate_question",
      selectedVacancyId: vacancyId,
      currentQuestionIndex: 0,
      isCompleted: false
    };
    await this.renderCurrentQuestion(ctx);
  }

  async renderCurrentQuestion(ctx: BotContext) {
    const draft = this.candidateFlowService.getDraft(ctx.session);
    if (!draft) return;

    if (this.candidateFlowService.hasCompletedQuestions(ctx.session)) {
      ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
        mode: "candidate",
        step: "candidate_confirm",
        text: `${messages.confirmSubmit}\n\n${screens.candidateConfirm(draft)}`,
        extra: {
          parse_mode: "Markdown",
          ...keyboards.candidateConfirm()
        }
      });
      return;
    }

    const question = this.candidateFlowService.getCurrentQuestion(ctx.session);
    if (!question) return;

    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "candidate",
      step: "candidate_question",
      text: screens.candidateQuestion(draft, ctx.session.currentQuestionIndex),
      extra: keyboards.candidateQuestion(question, ctx.session.currentQuestionIndex > 0)
    });
  }

  async cancelFlow(ctx: BotContext) {
    ctx.session = this.candidateFlowService.clearDraft(ctx.session);
    await this.showHome(ctx, true);
  }

  async showHome(ctx: BotContext, includeCancelled = false) {
    const text = includeCancelled
      ? `${messages.flowCancelled}\n\n${messages.welcome(ctx.from?.first_name)}`
      : messages.welcome(ctx.from?.first_name);
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "candidate",
      step: "home",
      text,
      extra: keyboards.candidateHome()
    });
  }

  async backQuestion(ctx: BotContext) {
    if (!this.candidateFlowService.getDraft(ctx.session)) {
      await this.showHome(ctx, true);
      return;
    }
    ctx.session = this.candidateFlowService.stepBack(ctx.session);
    await this.renderCurrentQuestion(ctx);
  }

  async answerFromCallback(ctx: BotContext, value: string) {
    if (!this.candidateFlowService.getDraft(ctx.session)) {
      await this.showHome(ctx, true);
      return;
    }
    ctx.session = this.candidateFlowService.applyAnswer(ctx.session, value);
    await this.renderCurrentQuestion(ctx);
  }

  async submit(ctx: BotContext) {
    const telegramId = getTelegramId(ctx);
    const draft = this.candidateFlowService.getDraft(ctx.session);
    if (!draft) {
      await this.showHome(ctx, true);
      return;
    }

    try {
      await this.candidateFlowService.submit({
        telegramId,
        fullName: `${ctx.from?.first_name ?? ""} ${ctx.from?.last_name ?? ""}`.trim() || undefined,
        username: ctx.from?.username,
        session: ctx.session
      });

      ctx.session = this.candidateFlowService.clearDraft(ctx.session);
      ctx.session = {
        ...ctx.session,
        mode: "candidate",
        step: "candidate_submitted",
        isCompleted: true
      };

      ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
        mode: "candidate",
        step: "candidate_submitted",
        text: messages.success,
        extra: keyboards.candidateHome()
      });
    } catch (error) {
      if (error instanceof Error) {
        const safeMessage = toUserFriendlyError(error.message);
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "candidate",
          step: "candidate_confirm",
          text: `${safeMessage}\n\n${messages.confirmSubmit}\n\n${screens.candidateConfirm(draft)}`,
          extra: {
            parse_mode: "Markdown",
            ...keyboards.candidateConfirm()
          }
        });
        return;
      }

      throw error;
    }
  }
}
