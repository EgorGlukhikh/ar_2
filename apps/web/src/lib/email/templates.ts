import { emailTemplateCatalogMap, type EmailTemplateKey } from "@/lib/email/catalog";

type EmailSection = {
  title?: string;
  text: string;
};

type EmailLayoutInput = {
  subject: string;
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: EmailSection[];
  ctaLabel: string;
  ctaUrl: string;
  preferencesUrl?: string;
  replyEmail?: string;
  footer?: string;
};

type AccountTemplateInput = {
  studentName: string;
  email: string;
  password: string;
  signInUrl: string;
  isExistingAccount?: boolean;
  replyEmail?: string;
};

type CourseAccessTemplateInput = {
  studentName: string;
  courseTitle: string;
  courseUrl: string;
  replyEmail?: string;
};

type PaymentSuccessTemplateInput = {
  studentName: string;
  courseTitle: string;
  amountLabel: string;
  learningUrl: string;
  replyEmail?: string;
};

export type RuntimeTemplateContext = {
  recipientName: string;
  courseTitle?: string;
  amountLabel?: string;
  links: {
    catalogUrl: string;
    signInUrl: string;
    learningUrl: string;
    courseUrl?: string;
    expertUrl?: string;
    preferencesUrl?: string;
  };
  replyEmail?: string;
};

export type RenderedEmailTemplate = {
  subject: string;
  preheader: string;
  html: string;
  text: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderSectionsHtml(sections: EmailSection[]) {
  return sections
    .map((section) => {
      const text = escapeHtml(section.text);
      if (!section.title) {
        return `<p style="margin:18px 0 0;font-size:15px;line-height:1.8;color:#5f6880;">${text}</p>`;
      }

      return `
        <div style="margin-top:20px;border:1px solid #dfe5f5;border-radius:20px;background:#f8faff;padding:18px 18px 16px;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#4d5a88;">
            ${escapeHtml(section.title)}
          </p>
          <p style="margin:0;font-size:15px;line-height:1.8;color:#25314d;">
            ${text}
          </p>
        </div>
      `;
    })
    .join("");
}

function renderSectionsText(sections: EmailSection[]) {
  return sections
    .map((section) =>
      section.title ? `${section.title}\n${section.text}` : section.text,
    )
    .join("\n\n");
}

function buildFooterHtml(input: EmailLayoutInput) {
  const items = [
    input.replyEmail
      ? `Если удобнее, просто ответьте на это письмо: ${escapeHtml(input.replyEmail)}.`
      : null,
    input.preferencesUrl
      ? `Настройки маркетинговых писем: <a href="${input.preferencesUrl}" style="color:#3552dd;text-decoration:underline;">управлять подпиской</a>.`
      : null,
    escapeHtml(
      input.footer ||
        "Академия риэлторов. Письмо отправлено автоматически из платформы, но за ним стоит живая команда.",
    ),
  ].filter(Boolean);

  return items
    .map(
      (item) =>
        `<p style="margin:10px 0 0;font-size:13px;line-height:1.8;color:#7a8399;">${item}</p>`,
    )
    .join("");
}

function buildFooterText(input: EmailLayoutInput) {
  const items = [
    input.replyEmail ? `Ответить можно на адрес: ${input.replyEmail}` : null,
    input.preferencesUrl
      ? `Настройки маркетинговых писем: ${input.preferencesUrl}`
      : null,
    input.footer ||
      "Академия риэлторов. Письмо отправлено автоматически из платформы, но за ним стоит живая команда.",
  ].filter(Boolean);

  return items.join("\n");
}

export function renderEmailLayout(input: EmailLayoutInput): RenderedEmailTemplate {
  const html = `
    <div style="margin:0;padding:28px 0;background:#eef3ff;font-family:Arial,sans-serif;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader)}</div>
      <div style="max-width:680px;margin:0 auto;padding:0 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;background:#ffffff;border:1px solid #dbe3f3;border-radius:28px;overflow:hidden;box-shadow:0 30px 80px rgba(33,45,94,0.10);">
          <tr>
            <td style="padding:28px 28px 24px;background:linear-gradient(135deg,#182036 0%,#2d47b3 54%,#e58a7f 100%);color:#ffffff;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="height:30px;width:30px;border-radius:10px;background:rgba(255,255,255,0.14);display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;letter-spacing:0.08em;">AR</div>
                <div style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.86);">
                  ${escapeHtml(input.eyebrow)}
                </div>
              </div>
              <h1 style="margin:18px 0 0;font-size:34px;line-height:1.04;font-weight:800;color:#ffffff;">
                ${escapeHtml(input.title)}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0;font-size:16px;line-height:1.9;color:#586177;">
                ${escapeHtml(input.intro)}
              </p>
              ${renderSectionsHtml(input.sections)}
              <div style="margin-top:28px;">
                <a href="${input.ctaUrl}" style="display:inline-block;border-radius:999px;background:#3552dd;padding:14px 24px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                  ${escapeHtml(input.ctaLabel)}
                </a>
              </div>
              <div style="margin-top:28px;padding-top:18px;border-top:1px solid #e6ebf8;">
                ${buildFooterHtml(input)}
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;

  const text = [
    input.subject,
    "",
    input.intro,
    "",
    renderSectionsText(input.sections),
    "",
    `${input.ctaLabel}: ${input.ctaUrl}`,
    "",
    buildFooterText(input),
  ].join("\n");

  return {
    subject: input.subject,
    preheader: input.preheader,
    html,
    text,
  };
}

export function renderStudentAccountCreatedTemplate(
  input: AccountTemplateInput,
): RenderedEmailTemplate {
  return renderEmailLayout({
    subject: input.isExistingAccount
      ? "Данные доступа к платформе обновлены"
      : "Ваша учетная запись на платформе готова",
    preheader: "Письмо с логином, временным паролем и ссылкой на вход в платформу.",
    eyebrow: "Доступ в платформу",
    title: input.isExistingAccount
      ? "Данные входа обновлены"
      : "Учетная запись готова",
    intro: input.isExistingAccount
      ? `${input.studentName}, для вашей учетной записи обновлены данные входа.`
      : `${input.studentName}, для вас создана учетная запись в Академии риэлторов.`,
    sections: [
      {
        title: "Почта для входа",
        text: input.email,
      },
      {
        title: "Временный пароль",
        text: input.password,
      },
      {
        title: "Что делать дальше",
        text: "Откройте платформу по кнопке ниже, войдите по почте и паролю и проверьте, какие курсы и материалы уже доступны в кабинете.",
      },
    ],
    ctaLabel: "Открыть платформу",
    ctaUrl: input.signInUrl,
    replyEmail: input.replyEmail,
  });
}

export function renderCourseAccessGrantedTemplate(
  input: CourseAccessTemplateInput,
): RenderedEmailTemplate {
  return renderEmailLayout({
    subject: `Открыт доступ к курсу «${input.courseTitle}»`,
    preheader: "Доступ уже открыт — можно перейти в курс и начать обучение.",
    eyebrow: "Доступ к курсу",
    title: "Курс уже доступен в кабинете",
    intro: `${input.studentName}, вам открыт доступ к курсу «${input.courseTitle}».`,
    sections: [
      {
        title: "Что внутри",
        text: "В курсе собраны уроки, видео, материалы, файлы и последовательные шаги обучения внутри платформы.",
      },
      {
        title: "Как проходить",
        text: "Откройте курс, начните с первого урока и двигайтесь по структуре программы, не теряя прогресс и доступ к материалам.",
      },
    ],
    ctaLabel: "Перейти к курсу",
    ctaUrl: input.courseUrl,
    replyEmail: input.replyEmail,
  });
}

export function renderPaymentSuccessTemplate(
  input: PaymentSuccessTemplateInput,
): RenderedEmailTemplate {
  return renderEmailLayout({
    subject: `Оплата курса «${input.courseTitle}» подтверждена`,
    preheader: "Оплата прошла успешно, доступ к обучению уже открыт.",
    eyebrow: "Оплата подтверждена",
    title: "Покупка прошла успешно",
    intro: `${input.studentName}, оплата курса «${input.courseTitle}» завершена.`,
    sections: [
      {
        title: "Сумма оплаты",
        text: input.amountLabel,
      },
      {
        title: "Что дальше",
        text: "Курс уже появился в вашем учебном кабинете. Можно сразу перейти к обучению и начать прохождение программы.",
      },
    ],
    ctaLabel: "Открыть обучение",
    ctaUrl: input.learningUrl,
    replyEmail: input.replyEmail,
  });
}

function renderStudentAutomationTemplate(
  key: Extract<
    EmailTemplateKey,
    | "student-welcome-1"
    | "student-welcome-2"
    | "student-welcome-3"
    | "student-welcome-4"
    | "student-welcome-5"
    | "student-reengage-no-start"
    | "student-reengage-stalled"
  >,
  input: RuntimeTemplateContext,
): RenderedEmailTemplate {
  switch (key) {
    case "student-welcome-1":
      return renderEmailLayout({
        subject: "Платформа уже готова к первому шагу",
        preheader: "Здесь видно каталог, формат программы и следующий шаг для ученика.",
        eyebrow: "Welcome 1 из 5",
        title: "Не просто доступ, а понятный маршрут",
        intro: `${input.recipientName}, внутри платформы уже можно посмотреть каталог, формат курсов и увидеть, как выглядит путь ученика от выбора программы до результата.`,
        sections: [
          {
            title: "С чего начать",
            text: "Откройте каталог и посмотрите, как устроены карточки программ, формат обучения и логика выбора курса.",
          },
          {
            title: "Зачем это письмо",
            text: "Мы хотим, чтобы вы с первого шага увидели платформу как удобный образовательный продукт, а не как набор разрозненных материалов.",
          },
        ],
        ctaLabel: "Открыть каталог",
        ctaUrl: input.links.catalogUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "student-welcome-2":
      return renderEmailLayout({
        subject: "Как устроен личный кабинет и обучение",
        preheader: "Личный кабинет, модули, уроки и прогресс работают в одном маршруте.",
        eyebrow: "Welcome 2 из 5",
        title: "Уроки, материалы и прогресс живут вместе",
        intro: "Внутри кабинета ученик видит не хаос файлов, а последовательное обучение: курс, модули, уроки, материалы и следующий шаг.",
        sections: [
          {
            title: "Что это дает",
            text: "Даже большой курс остается понятным, если у ученика есть структура, видимый прогресс и доступ ко всем материалам внутри урока.",
          },
          {
            title: "Что посмотреть",
            text: "Зайдите в кабинет и проверьте, как платформа ведет пользователя внутри программы от урока к уроку.",
          },
        ],
        ctaLabel: "Открыть кабинет",
        ctaUrl: input.links.learningUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "student-welcome-3":
      return renderEmailLayout({
        subject: "Как выбрать первый курс без лишнего шума",
        preheader: "Каталог помогает увидеть тему, формат, цену и следующий шаг прямо в карточке курса.",
        eyebrow: "Welcome 3 из 5",
        title: "Пора выбрать первую программу",
        intro: "Лучший способ быстро войти в платформу — открыть каталог и выбрать одну программу под текущую задачу, а не пытаться охватить все сразу.",
        sections: [
          {
            title: "Что важно в карточке курса",
            text: "Смотрите на результат, формат, стоимость и что именно получите после прохождения. Это помогает выбрать курс без перегруза.",
          },
          {
            title: "Что делать дальше",
            text: "Откройте каталог и выберите ту программу, которая ближе всего к вашей ближайшей рабочей цели.",
          },
        ],
        ctaLabel: "Выбрать курс",
        ctaUrl: input.links.catalogUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "student-welcome-4":
      return renderEmailLayout({
        subject: "Вернитесь в платформу и заберите свой следующий шаг",
        preheader: "Если вы уже открывали платформу, сейчас лучший момент вернуться и довести маршрут до действия.",
        eyebrow: "Welcome 4 из 5",
        title: "Платформа полезна только в движении",
        intro: "Пока курс не выбран или обучение не начато, потенциал платформы остается только возможностью. Дальше уже важен первый конкретный шаг.",
        sections: [
          {
            title: "Куда вернуться",
            text: "Либо откройте каталог, либо сразу зайдите в кабинет, если программа уже у вас есть.",
          },
          {
            title: "Что будет полезно",
            text: "Даже один выбранный курс с понятной структурой дает больше эффекта, чем десяток сохраненных ссылок и заметок.",
          },
        ],
        ctaLabel: "Вернуться в платформу",
        ctaUrl: input.links.learningUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "student-welcome-5":
      return renderEmailLayout({
        subject: "Пора перейти от интереса к действию",
        preheader: "Финальный шаг welcome-цепочки: открыть каталог и выбрать понятный сценарий обучения.",
        eyebrow: "Welcome 5 из 5",
        title: "Откройте первый маршрут до результата",
        intro: "Сейчас лучший момент выбрать первый курс и пройти путь до конца в одном контуре: выбор, доступ, уроки, прогресс и следующий шаг.",
        sections: [
          {
            title: "Если нужен старт",
            text: "Откройте каталог и выберите программу, которая ближе всего к вашей текущей задаче или роли.",
          },
          {
            title: "Если нужен живой ответ",
            text: "Вы всегда можете ответить на письмо, и команда платформы поможет сориентироваться по формату и следующему шагу.",
          },
        ],
        ctaLabel: "Перейти к выбору курса",
        ctaUrl: input.links.catalogUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "student-reengage-no-start":
      return renderEmailLayout({
        subject: `Доступ к курсу «${input.courseTitle ?? "выбранному курсу"}» уже открыт`,
        preheader: "Курс уже доступен — осталось сделать первый шаг и открыть стартовый урок.",
        eyebrow: "Напоминание",
        title: "Курс ждет первого урока",
        intro: `${input.recipientName}, доступ к курсу уже открыт, но обучение еще не началось. Самое ценное сейчас — просто войти и пройти первый урок.`,
        sections: [
          {
            title: "Почему это важно",
            text: "После первого урока маршрут перестает быть абстрактным: вы видите структуру, материалы и понимаете, как будете двигаться дальше.",
          },
          {
            title: "Что сделать сейчас",
            text: "Откройте курс и дайте себе 10–15 минут на первый шаг. Этого уже достаточно, чтобы включиться в обучение.",
          },
        ],
        ctaLabel: "Открыть курс",
        ctaUrl: input.links.courseUrl ?? input.links.learningUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "student-reengage-stalled":
      return renderEmailLayout({
        subject: `Пора вернуться к курсу «${input.courseTitle ?? "вашему курсу"}»`,
        preheader: "Прогресс остановился — мягко возвращаем вас в понятный маршрут обучения.",
        eyebrow: "Напоминание",
        title: "Вернитесь в обучение без перегруза",
        intro: `${input.recipientName}, вы уже начали обучение. Сейчас достаточно вернуться в курс и сделать один следующий шаг, чтобы снова войти в ритм.`,
        sections: [
          {
            title: "Что помогает вернуться",
            text: "Не нужно закрывать всю программу сразу. Вернитесь в последний урок, посмотрите, где остановились, и продолжайте с ближайшего шага.",
          },
          {
            title: "Что внутри уже ждет",
            text: "Уроки, материалы, файлы и структура программы никуда не делись — маршрут уже собран, осталось снова включиться.",
          },
        ],
        ctaLabel: "Продолжить курс",
        ctaUrl: input.links.courseUrl ?? input.links.learningUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
  }
}

function renderExpertAutomationTemplate(
  key: Extract<EmailTemplateKey, "expert-welcome-1" | "expert-welcome-2" | "expert-welcome-3">,
  input: RuntimeTemplateContext,
): RenderedEmailTemplate {
  switch (key) {
    case "expert-welcome-1":
      return renderEmailLayout({
        subject: "Платформа готова к упаковке вашей экспертизы",
        preheader: "Первый шаг для автора: посмотреть, как на площадке выглядит курс как продукт.",
        eyebrow: "Expert welcome 1 из 3",
        title: "Экспертизу можно превратить в понятный курс",
        intro: `${input.recipientName}, на платформе можно не только учиться, но и размещать авторские программы, которые выглядят как готовый цифровой продукт.`,
        sections: [
          {
            title: "Что посмотреть первым",
            text: "Посмотрите каталог и карточки программ: как подается результат, формат, цена и следующий шаг для студента.",
          },
          {
            title: "Почему это важно",
            text: "Сильный курс продает не количеством уроков, а ясной упаковкой, маршрутом и понятной ценностью для ученика.",
          },
        ],
        ctaLabel: "Посмотреть каталог",
        ctaUrl: input.links.catalogUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "expert-welcome-2":
      return renderEmailLayout({
        subject: "Курс должен выглядеть как продукт, а не как папка с файлами",
        preheader: "Внутри платформы курс упаковывается в структуру, сценарий и понятный путь ученика.",
        eyebrow: "Expert welcome 2 из 3",
        title: "Упаковка курса влияет на продажи не меньше контента",
        intro: "Платформа помогает собрать программу так, чтобы ученик видел тему, формат, логику прохождения и следующий шаг внутри продукта.",
        sections: [
          {
            title: "Что важно для автора",
            text: "Нужны не только материалы, но и понятный маршрут: модули, уроки, файлы, задания, записи и живые форматы в одном контуре.",
          },
          {
            title: "Что это дает",
            text: "Такой курс проще продавать, запускать и сопровождать, а ученику проще дойти до результата.",
          },
        ],
        ctaLabel: "Открыть платформу",
        ctaUrl: input.links.expertUrl ?? input.links.signInUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "expert-welcome-3":
      return renderEmailLayout({
        subject: "Готовы обсудить запуск первой программы",
        preheader: "Следующий шаг — отправить программу, обсудить пилот или собрать курс под запуск.",
        eyebrow: "Expert welcome 3 из 3",
        title: "Давайте переведем экспертизу в рабочий запуск",
        intro: "Если вы хотите разместить программу на площадке, дальше можно перейти к обсуждению структуры курса, пилота или первого набора.",
        sections: [
          {
            title: "Какие сценарии подходят",
            text: "Авторский курс, поток, вебинарная серия, практический интенсив или смешанный формат с записями и сопровождением.",
          },
          {
            title: "Что сделать сейчас",
            text: "Ответьте на письмо или зайдите в рабочий контур платформы, чтобы перейти к следующему шагу по запуску.",
          },
        ],
        ctaLabel: "Перейти в рабочий контур",
        ctaUrl: input.links.expertUrl ?? input.links.signInUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
  }
}

function renderCampaignTemplate(
  key: Extract<
    EmailTemplateKey,
    "campaign-course-launch" | "campaign-live-intake" | "campaign-catalog-return" | "campaign-expert-invite"
  >,
  input: RuntimeTemplateContext,
): RenderedEmailTemplate {
  switch (key) {
    case "campaign-course-launch":
      return renderEmailLayout({
        subject: `Новый курс на платформе: «${input.courseTitle ?? "Новая программа"}»`,
        preheader: "Открыли новую программу — можно посмотреть формат, результат и следующий шаг.",
        eyebrow: "Новая программа",
        title: input.courseTitle ?? "Новый курс уже на платформе",
        intro: "На платформе появилась новая программа. В карточке курса уже видно, кому она подходит, что вы получите и как выглядит следующий шаг после входа.",
        sections: [
          {
            title: "Что внутри",
            text: "Программа собрана как понятный маршрут: уроки, материалы, формат обучения и ожидаемый результат видны еще до старта.",
          },
          {
            title: "Кому будет полезно",
            text: "Если вы ищете структурированное обучение по конкретной задаче, это хороший момент открыть карточку курса и проверить, подходит ли программа вам сейчас.",
          },
        ],
        ctaLabel: "Открыть курс",
        ctaUrl: input.links.courseUrl ?? input.links.catalogUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "campaign-live-intake":
      return renderEmailLayout({
        subject: `Открыт набор: «${input.courseTitle ?? "Новый поток"}»`,
        preheader: "Запускаем живой поток или набор — можно посмотреть формат и занять место.",
        eyebrow: "Набор открыт",
        title: input.courseTitle ?? "Стартует новый поток",
        intro: "Если вам важен живой формат и движение по расписанию, сейчас можно занять место в новом наборе и войти в обучение в ближайший старт.",
        sections: [
          {
            title: "Почему обратить внимание",
            text: "Живой поток помогает удерживать темп, задавать вопросы и проходить программу в рамках понятного календаря.",
          },
          {
            title: "Что сделать сейчас",
            text: "Откройте карточку программы, посмотрите формат, стоимость и следующий шаг для входа.",
          },
        ],
        ctaLabel: "Посмотреть набор",
        ctaUrl: input.links.courseUrl ?? input.links.catalogUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "campaign-catalog-return":
      return renderEmailLayout({
        subject: "В каталоге появились программы, с которых удобно начать",
        preheader: "Если давно не заходили, сейчас хороший момент вернуться и выбрать следующий курс.",
        eyebrow: "Вернуться в каталог",
        title: "Пора снова открыть каталог",
        intro: "Если вы давно не заходили в платформу, сейчас хороший момент вернуться и посмотреть программы, которые можно открыть под текущую задачу.",
        sections: [
          {
            title: "Что поменялось",
            text: "Каталог помогает быстро понять тему, формат, цену и следующий шаг без перегруза и лишнего шума.",
          },
          {
            title: "Как использовать",
            text: "Откройте каталог и выберите одну программу, которая ближе всего к вашей ближайшей цели.",
          },
        ],
        ctaLabel: "Вернуться в каталог",
        ctaUrl: input.links.catalogUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "campaign-expert-invite":
      return renderEmailLayout({
        subject: "Разместите свою экспертизу на платформе",
        preheader: "Если у вас есть сильная практика, ее можно упаковать в курс и запустить на площадке.",
        eyebrow: "Приглашение эксперта",
        title: "Экспертиза может стать продуктом",
        intro: "Если у вас есть опыт, практические кейсы и понятная тема, платформа поможет превратить это в курс, поток или обучающий продукт.",
        sections: [
          {
            title: "Что вы получаете",
            text: "Готовую площадку для упаковки программы, маршрут для ученика и контур для монетизации своей экспертизы.",
          },
          {
            title: "Какой следующий шаг",
            text: "Ответьте на письмо или перейдите в рабочий контур платформы, чтобы обсудить тему, формат и запуск пилота.",
          },
        ],
        ctaLabel: "Перейти к запуску",
        ctaUrl: input.links.expertUrl ?? input.links.signInUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
  }
}

export function renderTemplateByKey(
  key: EmailTemplateKey,
  input: RuntimeTemplateContext,
): RenderedEmailTemplate {
  if (!(key in emailTemplateCatalogMap)) {
    throw new Error(`Unknown email template key: ${key}`);
  }

  if (key.startsWith("student-welcome") || key.startsWith("student-reengage")) {
    return renderStudentAutomationTemplate(
      key as Extract<
        EmailTemplateKey,
        | "student-welcome-1"
        | "student-welcome-2"
        | "student-welcome-3"
        | "student-welcome-4"
        | "student-welcome-5"
        | "student-reengage-no-start"
        | "student-reengage-stalled"
      >,
      input,
    );
  }

  if (key.startsWith("expert-welcome")) {
    return renderExpertAutomationTemplate(
      key as Extract<
        EmailTemplateKey,
        "expert-welcome-1" | "expert-welcome-2" | "expert-welcome-3"
      >,
      input,
    );
  }

  if (key.startsWith("campaign-")) {
    return renderCampaignTemplate(
      key as Extract<
        EmailTemplateKey,
        | "campaign-course-launch"
        | "campaign-live-intake"
        | "campaign-catalog-return"
        | "campaign-expert-invite"
      >,
      input,
    );
  }

  throw new Error(`Template "${key}" is not handled by renderTemplateByKey.`);
}
