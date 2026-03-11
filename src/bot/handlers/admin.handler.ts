import { QuestionType, type CandidateStatus } from "../../types/application.types";
import {
  parseChoiceOptions,
  parsePositiveOrder,
  parseQuestionKey,
  parseQuestionText,
  parseVacancySlug,
  parseVacancyTitle
} from "../../common/validators/common.validators";
import { BotContext } from "../../types/bot.types";
import { AdminService } from "../../modules/admin/admin.service";
import { AdminFlowService } from "../services/admin-flow.service";
import { SessionFlowService } from "../services/session-flow.service";
import { keyboards } from "../ui/keyboards";
import { formatStatus, messages, withValidationHint } from "../ui/messages";
import { screens } from "../ui/screens";
import { AppError } from "../../common/errors/app-error";
import { SessionStep } from "../../types/session.types";

export class AdminHandler {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminFlowService: AdminFlowService,
    private readonly sessionFlowService: SessionFlowService
  ) {}

  isAdminUser(telegramId: number | bigint): boolean {
    return this.adminService.isAdmin(BigInt(telegramId));
  }

  private assertAdmin(ctx: BotContext) {
    const telegramId = BigInt(ctx.from?.id ?? 0);
    if (!this.adminService.isAdmin(telegramId)) {
      throw new AppError(messages.adminDenied, 403);
    }
    return telegramId;
  }

  async recoverAdminStep(ctx: BotContext, step: SessionStep, errorMessage?: string) {
    const withErr = (text: string) => (errorMessage ? withValidationHint(errorMessage, text) : text);
    const vacancyId = ctx.session.draftData?.adminSelectedVacancyId;
    const noteAppId =
      ctx.session.draftData?.adminSelectedApplicationId ??
      (ctx.session.draftData?.adminPendingAction?.type === "add_note"
        ? ctx.session.draftData.adminPendingAction.applicationId
        : undefined);

    switch (step) {
      case "admin_vacancy_create_title":
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step,
          text: withErr(messages.adminCreateVacancyTitle),
          extra: keyboards.adminCancelToVacancies()
        });
        return;
      case "admin_vacancy_create_slug":
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step,
          text: withErr(messages.adminCreateVacancySlug),
          extra: keyboards.adminCancelToVacancies()
        });
        return;
      case "admin_vacancy_create_description":
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step,
          text: withErr(messages.adminCreateVacancyDescription),
          extra: keyboards.adminCancelToVacancies()
        });
        return;
      case "admin_vacancy_edit_title":
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step,
          text: withErr(messages.adminEditVacancyTitle),
          extra: keyboards.adminCancelToVacancyCard()
        });
        return;
      case "admin_vacancy_edit_slug":
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step,
          text: withErr(messages.adminEditVacancySlug),
          extra: keyboards.adminCancelToVacancyCard()
        });
        return;
      case "admin_vacancy_edit_description":
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step,
          text: withErr(messages.adminEditVacancyDescription),
          extra: keyboards.adminCancelToVacancyCard()
        });
        return;
      case "admin_question_create_key":
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step,
          text: withErr(messages.adminQuestionCreateKey),
          extra: keyboards.adminCancelToVacancyCard()
        });
        return;
      case "admin_question_create_text":
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step,
          text: withErr(messages.adminQuestionCreateText),
          extra: keyboards.adminCancelToVacancyCard()
        });
        return;
      case "admin_question_create_type":
        if (!vacancyId) {
          await this.showVacancies(ctx);
          return;
        }
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step,
          text: withErr(messages.adminQuestionCreateType),
          extra: keyboards.adminQuestionTypePicker(vacancyId)
        });
        return;
      case "admin_question_create_required":
        if (!vacancyId) {
          await this.showVacancies(ctx);
          return;
        }
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step,
          text: withErr(messages.adminQuestionCreateRequired),
          extra: keyboards.adminQuestionRequiredPicker(vacancyId)
        });
        return;
      case "admin_question_create_placeholder":
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step,
          text: withErr(messages.adminQuestionCreatePlaceholder),
          extra: keyboards.adminSkipKeyboard()
        });
        return;
      case "admin_question_create_options":
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step,
          text: withErr(messages.adminQuestionCreateOptions),
          extra: keyboards.adminCancelToVacancyCard()
        });
        return;
      case "admin_question_order_input":
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step,
          text: withErr(messages.adminQuestionOrderPrompt),
          extra: keyboards.adminCancelToVacancyCard()
        });
        return;
      case "admin_note_input":
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step,
          text: withErr(messages.adminNotePrompt),
          extra: noteAppId ? keyboards.adminBackToApplication(noteAppId) : keyboards.adminMenu()
        });
        return;
      case "admin_vacancy_delete_confirm":
        if (!vacancyId) {
          await this.showVacancies(ctx);
          return;
        }
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step,
          text: withErr(messages.adminDeleteVacancyConfirm),
          extra: keyboards.adminDeleteVacancyConfirm(vacancyId)
        });
        return;
      default:
        if (vacancyId) {
          await this.openVacancyCard(ctx, vacancyId);
          return;
        }
        await this.showVacancies(ctx);
    }
  }

  async openAdminMenu(ctx: BotContext) {
    this.assertAdmin(ctx);
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_menu",
      text: messages.adminMenu,
      extra: keyboards.adminMenu()
    });
  }

  async showVacancies(ctx: BotContext) {
    this.assertAdmin(ctx);
    const vacancies = await this.adminFlowService.getVacancies();
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_vacancies",
      text: `${messages.adminVacanciesMenu}\n\n${screens.adminVacancies(vacancies)}`,
      extra: keyboards.adminVacancies(
        vacancies.map((v: { id: string; title: string; isActive: boolean }) => ({
          id: v.id,
          title: v.title,
          isActive: v.isActive
        }))
      )
    });
  }

  async openVacancyCard(ctx: BotContext, vacancyId: string) {
    this.assertAdmin(ctx);
    const vacancy = await this.adminFlowService.getVacancy(vacancyId);
    ctx.session = {
      ...ctx.session,
      step: "admin_vacancy_card",
      draftData: {
        ...ctx.session.draftData,
        adminSelectedVacancyId: vacancyId,
        adminSelectedQuestionId: undefined,
        adminPendingAction: null
      }
    };
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_vacancy_card",
      text: screens.adminVacancyCard(vacancy),
      extra: keyboards.adminVacancyCard(
        vacancy.id,
        vacancy.isActive,
        vacancy.questions.map((q: { id: string; order: number; key: string }) => ({
          id: q.id,
          order: q.order,
          key: q.key
        }))
      )
    });
  }

  async toggleVacancy(ctx: BotContext, vacancyId: string) {
    this.assertAdmin(ctx);
    await this.adminFlowService.toggleVacancy(vacancyId);
    await this.openVacancyCard(ctx, vacancyId);
  }

  async beginCreateVacancy(ctx: BotContext) {
    this.assertAdmin(ctx);
    ctx.session = {
      ...ctx.session,
      mode: "admin",
      step: "admin_vacancy_create_title",
      draftData: {
        ...ctx.session.draftData,
        adminVacancyDraft: {}
      }
    };
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_vacancy_create_title",
      text: messages.adminCreateVacancyTitle,
      extra: keyboards.adminCancelToVacancies()
    });
  }

  async beginEditVacancyTitle(ctx: BotContext, vacancyId: string) {
    this.assertAdmin(ctx);
    ctx.session = {
      ...ctx.session,
      mode: "admin",
      step: "admin_vacancy_edit_title",
      draftData: {
        ...ctx.session.draftData,
        adminPendingAction: { type: "vacancy_edit_title", vacancyId }
      }
    };
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_vacancy_edit_title",
      text: messages.adminEditVacancyTitle,
      extra: keyboards.adminCancelToVacancyCard()
    });
  }

  async beginEditVacancySlug(ctx: BotContext, vacancyId: string) {
    this.assertAdmin(ctx);
    ctx.session = {
      ...ctx.session,
      mode: "admin",
      step: "admin_vacancy_edit_slug",
      draftData: {
        ...ctx.session.draftData,
        adminPendingAction: { type: "vacancy_edit_slug", vacancyId }
      }
    };
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_vacancy_edit_slug",
      text: messages.adminEditVacancySlug,
      extra: keyboards.adminCancelToVacancyCard()
    });
  }

  async beginEditVacancyDescription(ctx: BotContext, vacancyId: string) {
    this.assertAdmin(ctx);
    ctx.session = {
      ...ctx.session,
      mode: "admin",
      step: "admin_vacancy_edit_description",
      draftData: {
        ...ctx.session.draftData,
        adminPendingAction: { type: "vacancy_edit_description", vacancyId }
      }
    };
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_vacancy_edit_description",
      text: messages.adminEditVacancyDescription,
      extra: keyboards.adminCancelToVacancyCard()
    });
  }

  async confirmDeleteVacancy(ctx: BotContext, vacancyId: string) {
    this.assertAdmin(ctx);
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_vacancy_delete_confirm",
      text: messages.adminDeleteVacancyConfirm,
      extra: keyboards.adminDeleteVacancyConfirm(vacancyId)
    });
  }

  async deleteVacancy(ctx: BotContext, vacancyId: string) {
    this.assertAdmin(ctx);
    await this.adminFlowService.deleteVacancy(vacancyId);
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_vacancies",
      text: messages.adminVacancyDeleted
    });
    await this.showVacancies(ctx);
  }

  async beginAddQuestion(ctx: BotContext, vacancyId: string) {
    this.assertAdmin(ctx);
    ctx.session = {
      ...ctx.session,
      mode: "admin",
      step: "admin_question_create_key",
      draftData: {
        ...ctx.session.draftData,
        adminSelectedVacancyId: vacancyId,
        adminQuestionDraft: {
          vacancyId
        }
      }
    };
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_question_create_key",
      text: messages.adminQuestionCreateKey,
      extra: keyboards.adminCancelToVacancyCard()
    });
  }

  async setQuestionType(ctx: BotContext, vacancyId: string, type: QuestionType) {
    this.assertAdmin(ctx);
    ctx.session = {
      ...ctx.session,
      step: "admin_question_create_required",
      draftData: {
        ...ctx.session.draftData,
        adminQuestionDraft: {
          ...ctx.session.draftData?.adminQuestionDraft,
          vacancyId,
          type
        }
      }
    };
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_question_create_required",
      text: messages.adminQuestionCreateRequired,
      extra: keyboards.adminQuestionRequiredPicker(vacancyId)
    });
  }

  async setQuestionRequired(ctx: BotContext, vacancyId: string, required: boolean) {
    this.assertAdmin(ctx);
    ctx.session = {
      ...ctx.session,
      step: "admin_question_create_placeholder",
      draftData: {
        ...ctx.session.draftData,
        adminQuestionDraft: {
          ...ctx.session.draftData?.adminQuestionDraft,
          vacancyId,
          isRequired: required
        }
      }
    };
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_question_create_placeholder",
      text: messages.adminQuestionCreatePlaceholder,
      extra: keyboards.adminSkipKeyboard()
    });
  }

  async skipPlaceholder(ctx: BotContext) {
    this.assertAdmin(ctx);
    const draft = ctx.session.draftData?.adminQuestionDraft;
    if (!draft?.vacancyId || !draft.type) return;
    if (draft.type === QuestionType.CHOICE) {
      ctx.session = {
        ...ctx.session,
        step: "admin_question_create_options"
      };
      ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
        mode: "admin",
        step: "admin_question_create_options",
        text: messages.adminQuestionCreateOptions
      });
      return;
    }
    await this.saveQuestionFromDraft(ctx, undefined);
  }

  async deleteQuestion(ctx: BotContext, questionId: string) {
    this.assertAdmin(ctx);
    const vacancyId = ctx.session.draftData?.adminSelectedVacancyId;
    await this.adminFlowService.deleteQuestion(questionId);
    if (vacancyId) {
      await this.openVacancyCard(ctx, vacancyId);
      return;
    }
    await this.showVacancies(ctx);
  }

  async beginReorderQuestion(ctx: BotContext, questionId: string) {
    this.assertAdmin(ctx);
    const vacancyId = ctx.session.draftData?.adminSelectedVacancyId;
    if (!vacancyId) throw new AppError("Vacancy is not selected", 400);
    ctx.session = {
      ...ctx.session,
      step: "admin_question_order_input",
      draftData: {
        ...ctx.session.draftData,
        adminSelectedQuestionId: questionId,
        adminPendingAction: {
          type: "question_reorder",
          vacancyId,
          questionId
        }
      }
    };
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_question_order_input",
      text: messages.adminQuestionOrderPrompt,
      extra: keyboards.adminCancelToVacancyCard()
    });
  }

  async showApplications(ctx: BotContext) {
    this.assertAdmin(ctx);
    const page = ctx.session.draftData?.adminApplicationsPage ?? 0;
    const { items, total } = await this.adminFlowService.getApplications(page);
    const pageSize = 8;
    const hasPrev = page > 0;
    const hasNext = (page + 1) * pageSize < total;

    if (!items.length) {
      ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
        mode: "admin",
        step: "admin_applications",
        text: messages.adminNoApplications,
        extra: keyboards.adminMenu()
      });
      return;
    }

    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_applications",
      text: "Applications:",
      extra: keyboards.adminApplications(
        items.map((item: { id: string; vacancy: { title: string }; fullName?: string | null; username?: string | null; status: CandidateStatus }) => ({
          id: item.id,
          label: `${item.vacancy.title} | ${item.fullName ?? item.username ?? "Unknown"} | ${formatStatus(
            item.status
          )}`
        })),
        hasPrev,
        hasNext
      )
    });
  }

  async openApplication(ctx: BotContext, applicationId: string) {
    this.assertAdmin(ctx);
    const application = await this.adminFlowService.getApplication(applicationId);
    ctx.session = {
      ...ctx.session,
      draftData: {
        ...ctx.session.draftData,
        adminSelectedApplicationId: applicationId
      }
    };
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_application_card",
      text: screens.adminApplicationCard(application),
      extra: keyboards.adminApplicationCard(applicationId)
    });
  }

  async setStatus(ctx: BotContext, applicationId: string, status: CandidateStatus) {
    const adminTelegramId = this.assertAdmin(ctx);
    await this.adminFlowService.setApplicationStatus(applicationId, status, adminTelegramId);
    await this.openApplication(ctx, applicationId);
  }

  async beginAddNote(ctx: BotContext, applicationId: string) {
    this.assertAdmin(ctx);
    ctx.session = {
      ...ctx.session,
      mode: "admin",
      step: "admin_note_input",
      draftData: {
        ...ctx.session.draftData,
        adminPendingAction: {
          type: "add_note",
          applicationId
        }
      }
    };
    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_note_input",
      text: messages.adminNotePrompt,
      extra: keyboards.adminBackToApplication(applicationId)
    });
  }

  async completeAddNote(ctx: BotContext, noteText: string) {
    const adminTelegramId = this.assertAdmin(ctx);
    const pending = ctx.session.draftData?.adminPendingAction;
    if (!pending || pending.type !== "add_note") {
      return false;
    }

    await this.adminFlowService.addInternalNote(pending.applicationId, noteText, adminTelegramId);
    ctx.session = {
      ...ctx.session,
      draftData: {
        ...ctx.session.draftData,
        adminPendingAction: null
      }
    };

    ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
      mode: "admin",
      step: "admin_note_input",
      text: messages.adminNoteSaved
    });
    await this.openApplication(ctx, pending.applicationId);
    return true;
  }

  async handleTextInput(ctx: BotContext, text: string): Promise<boolean> {
    this.assertAdmin(ctx);

    if (await this.completeAddNote(ctx, text)) return true;

    const step = ctx.session.step;
    if (!step) return false;

    if (step === "admin_vacancy_create_title") {
      const title = parseVacancyTitle(text);
      ctx.session = {
        ...ctx.session,
        step: "admin_vacancy_create_slug",
        draftData: {
          ...ctx.session.draftData,
          adminVacancyDraft: {
            ...ctx.session.draftData?.adminVacancyDraft,
            title
          }
        }
      };
      ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
        mode: "admin",
        step: "admin_vacancy_create_slug",
        text: messages.adminCreateVacancySlug,
        extra: keyboards.adminCancelToVacancies()
      });
      return true;
    }

    if (step === "admin_vacancy_create_slug") {
      const slug = parseVacancySlug(text);
      ctx.session = {
        ...ctx.session,
        step: "admin_vacancy_create_description",
        draftData: {
          ...ctx.session.draftData,
          adminVacancyDraft: {
            ...ctx.session.draftData?.adminVacancyDraft,
            slug
          }
        }
      };
      ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
        mode: "admin",
        step: "admin_vacancy_create_description",
        text: messages.adminCreateVacancyDescription,
        extra: keyboards.adminCancelToVacancies()
      });
      return true;
    }

    if (step === "admin_vacancy_create_description") {
      const description = text.trim();
      if (!description) throw new AppError("Vacancy description cannot be empty", 400);
      const draft = ctx.session.draftData?.adminVacancyDraft;
      if (!draft?.title || !draft.slug) throw new AppError("Vacancy draft is incomplete", 400);
      const vacancy = await this.adminFlowService.createVacancy({
        title: draft.title,
        slug: draft.slug,
        description
      });
      ctx.session = {
        ...ctx.session,
        draftData: {
          ...ctx.session.draftData,
          adminVacancyDraft: undefined
        }
      };
      await this.openVacancyCard(ctx, vacancy.id);
      return true;
    }

    const pending = ctx.session.draftData?.adminPendingAction;
    if (pending?.type === "vacancy_edit_title") {
      await this.adminFlowService.updateVacancy(pending.vacancyId, { title: parseVacancyTitle(text) });
      await this.openVacancyCard(ctx, pending.vacancyId);
      return true;
    }
    if (pending?.type === "vacancy_edit_slug") {
      await this.adminFlowService.updateVacancy(pending.vacancyId, { slug: parseVacancySlug(text) });
      await this.openVacancyCard(ctx, pending.vacancyId);
      return true;
    }
    if (pending?.type === "vacancy_edit_description") {
      const description = text.trim();
      if (!description) throw new AppError("Vacancy description cannot be empty", 400);
      await this.adminFlowService.updateVacancy(pending.vacancyId, { description });
      await this.openVacancyCard(ctx, pending.vacancyId);
      return true;
    }
    if (pending?.type === "question_reorder") {
      const order = parsePositiveOrder(text);
      await this.adminFlowService.reorderQuestion(pending.questionId, order);
      await this.openVacancyCard(ctx, pending.vacancyId);
      return true;
    }

    if (step === "admin_question_create_key") {
      const key = parseQuestionKey(text);
      const draft = ctx.session.draftData?.adminQuestionDraft;
      if (!draft?.vacancyId) throw new AppError("Vacancy is not selected", 400);
      ctx.session = {
        ...ctx.session,
        step: "admin_question_create_text",
        draftData: {
          ...ctx.session.draftData,
          adminQuestionDraft: {
            ...draft,
            key
          }
        }
      };
      ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
        mode: "admin",
        step: "admin_question_create_text",
        text: messages.adminQuestionCreateText,
        extra: keyboards.adminCancelToVacancyCard()
      });
      return true;
    }

    if (step === "admin_question_create_text") {
      const question = parseQuestionText(text);
      const draft = ctx.session.draftData?.adminQuestionDraft;
      if (!draft?.vacancyId) throw new AppError("Vacancy is not selected", 400);
      ctx.session = {
        ...ctx.session,
        step: "admin_question_create_type",
        draftData: {
          ...ctx.session.draftData,
          adminQuestionDraft: {
            ...draft,
            question
          }
        }
      };
      ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
        mode: "admin",
        step: "admin_question_create_type",
        text: messages.adminQuestionCreateType,
        extra: keyboards.adminQuestionTypePicker(draft.vacancyId)
      });
      return true;
    }

    if (step === "admin_question_create_placeholder") {
      const placeholder = text.trim();
      if (!placeholder) throw new AppError("Placeholder cannot be empty. Use Skip if not needed.", 400);
      const draft = ctx.session.draftData?.adminQuestionDraft;
      if (!draft?.vacancyId) throw new AppError("Vacancy is not selected", 400);
      if (draft?.type === QuestionType.CHOICE) {
        ctx.session = {
          ...ctx.session,
          step: "admin_question_create_options",
          draftData: {
            ...ctx.session.draftData,
            adminQuestionDraft: {
              ...draft,
              placeholder
            }
          }
        };
        ctx.session = await this.sessionFlowService.renderScreen(ctx, ctx.session, {
          mode: "admin",
          step: "admin_question_create_options",
          text: messages.adminQuestionCreateOptions,
          extra: keyboards.adminCancelToVacancyCard()
        });
        return true;
      }
      await this.saveQuestionFromDraft(ctx, placeholder);
      return true;
    }

    if (step === "admin_question_create_options") {
      const options = parseChoiceOptions(text);
      await this.saveQuestionFromDraft(ctx, undefined, options);
      return true;
    }

    return false;
  }

  private async saveQuestionFromDraft(ctx: BotContext, placeholder?: string, options?: string[]) {
    const draft = ctx.session.draftData?.adminQuestionDraft;
    if (!draft?.vacancyId || !draft.key || !draft.question || !draft.type) {
      throw new AppError("Question draft is incomplete", 400);
    }
    const finalPlaceholder = placeholder ?? draft.placeholder;
    const finalOptions = options ?? draft.options;
    await this.adminFlowService.createQuestion({
      vacancyId: draft.vacancyId,
      key: draft.key,
      question: draft.question,
      type: draft.type,
      isRequired: draft.isRequired ?? true,
      placeholder: finalPlaceholder || undefined,
      optionsJson: draft.type === QuestionType.CHOICE ? finalOptions : undefined
    });
    ctx.session = {
      ...ctx.session,
      draftData: {
        ...ctx.session.draftData,
        adminQuestionDraft: undefined
      }
    };
    await this.openVacancyCard(ctx, draft.vacancyId);
  }
}
