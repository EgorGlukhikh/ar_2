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
      ? `Данные доступа обновлены, ${input.studentName}!`
      : `Добро пожаловать в Академию риэлторов, ${input.studentName}!`,
    preheader: input.isExistingAccount
      ? "Новые данные входа уже готовы — можно вернуться в личный кабинет."
      : "Ваш путь к успеху в недвижимости начинается здесь.",
    eyebrow: input.isExistingAccount ? "Данные входа" : "Регистрация",
    title: input.isExistingAccount
      ? "Данные входа обновлены"
      : "Рады видеть вас в Академии риэлторов!",
    intro: input.isExistingAccount
      ? `Привет, ${input.studentName}! Для вашей учетной записи обновлены данные входа.`
      : `Привет, ${input.studentName}! Благодарим за регистрацию в Академии риэлторов. Мы рады, что вы присоединились к нашему сообществу профессионалов, стремящихся к развитию и новым достижениям в сфере недвижимости. Здесь вы найдете все необходимое для успешного старта и роста вашей карьеры.`,
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
        title: "Что дальше",
        text: input.isExistingAccount
          ? "Перейдите по кнопке ниже, войдите с новыми данными и продолжайте работу в личном кабинете."
          : "Ваш аккаунт успешно создан. Теперь вы можете войти в личный кабинет, чтобы ознакомиться с каталогом курсов, выбрать подходящие программы и начать обучение. Мы постоянно обновляем материалы и добавляем новые курсы, чтобы вы всегда были в курсе последних тенденций и инструментов рынка.",
      },
    ],
    ctaLabel: "Войти в личный кабинет",
    ctaUrl: input.signInUrl,
    replyEmail: input.replyEmail,
  });
}

export function renderCourseAccessGrantedTemplate(
  input: CourseAccessTemplateInput,
): RenderedEmailTemplate {
  return renderEmailLayout({
    subject: `Ваш курс «${input.courseTitle}» уже ждет вас, ${input.studentName}!`,
    preheader: "Начните обучение прямо сейчас и освойте новые навыки.",
    eyebrow: "Доступ к курсу",
    title: `Поздравляем! Вы получили доступ к курсу «${input.courseTitle}»`,
    intro: `Привет, ${input.studentName}! Мы рады сообщить, что вы успешно получили доступ к курсу «${input.courseTitle}». Это отличный шаг на пути к вашему профессиональному росту! В этом курсе вы найдете актуальные знания и практические инструменты, которые помогут вам достичь новых высот в сфере недвижимости.`,
    sections: [
      {
        title: "Что дальше",
        text: "Для начала обучения просто перейдите по кнопке ниже. В личном кабинете вас ждут все материалы курса, задания и возможность отслеживать свой прогресс. Желаем вам продуктивного обучения и вдохновляющих открытий!",
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
    subject: `Ваш платеж за курс «${input.courseTitle}» успешно прошел!`,
    preheader: "Благодарим за покупку! Доступ к курсу уже открыт.",
    eyebrow: "Оплата",
    title: `Платеж успешно принят! Добро пожаловать на курс «${input.courseTitle}»`,
    intro: `Привет, ${input.studentName}! Ваш платеж за курс «${input.courseTitle}» успешно обработан. Благодарим вас за доверие и выбор нашей Академии! Мы уверены, что этот курс станет ценным вкладом в ваше профессиональное развитие.`,
    sections: [
      {
        title: "Сумма оплаты",
        text: input.amountLabel,
      },
      {
        title: "Что дальше",
        text: "Доступ к курсу уже открыт. Вы можете перейти к обучению прямо сейчас, нажав на кнопку ниже. В личном кабинете вы найдете все необходимые материалы, сможете отслеживать свой прогресс и общаться с другими студентами. Успехов в обучении!",
      },
    ],
    ctaLabel: "Начать обучение",
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
        subject: `Добро пожаловать в Академию риэлторов, ${input.recipientName}! Ваш путь к успеху начинается здесь.`,
        preheader: "Откройте мир профессионального роста в недвижимости.",
        eyebrow: "Welcome 1 из 5",
        title: "Рады приветствовать вас в Академии риэлторов!",
        intro: `Привет, ${input.recipientName}! Мы очень рады, что вы присоединились к нашему сообществу. Академия риэлторов — это ваш надежный партнер в мире недвижимости, где каждый найдет возможности для развития и роста.`,
        sections: [
          {
            title: "Что дальше",
            text: "Здесь вы сможете освоить новые навыки, углубить знания и получить практические инструменты для успешной работы. Начните свое путешествие по каталогу курсов, чтобы найти идеальную программу для ваших целей.",
          },
        ],
        ctaLabel: "Изучить каталог курсов",
        ctaUrl: input.links.catalogUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "student-welcome-2":
      return renderEmailLayout({
        subject: "Откройте для себя Базовый курс 2.0: фундамент для каждого риэлтора!",
        preheader: "Узнайте, как быстро освоить основы профессии.",
        eyebrow: "Welcome 2 из 5",
        title: "Базовый курс 2.0: ваш быстрый старт в недвижимости!",
        intro: `Привет, ${input.recipientName}! Если вы только начинаете свой путь в недвижимости или хотите освежить базовые знания, у нас есть отличная новость! Мы недавно записали обновленный «Базовый курс 2.0», который станет вашим надежным фундаментом.`,
        sections: [
          {
            title: "Почему стоит посмотреть",
            text: "В этом курсе собраны самые актуальные методики и практические кейсы, необходимые для уверенного старта. Он поможет вам быстро освоить ключевые аспекты профессии и избежать распространенных ошибок. Не упустите возможность получить знания от ведущих экспертов!",
          },
        ],
        ctaLabel: "Узнать больше о курсе 2.0",
        ctaUrl: input.links.catalogUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "student-welcome-3":
      return renderEmailLayout({
        subject: `Какие курсы подходят именно вам, ${input.recipientName}? Разбираемся вместе!`,
        preheader: "Выберите свой идеальный формат обучения и начните развиваться.",
        eyebrow: "Welcome 3 из 5",
        title: "Вариативность обучения для вашего успеха!",
        intro: `Привет, ${input.recipientName}! В Академии риэлторов мы понимаем, что у каждого свой темп и предпочтения в обучении. Именно поэтому мы предлагаем разнообразные курсы и форматы, чтобы вы могли выбрать то, что идеально подходит именно вам.`,
        sections: [
          {
            title: "Что посмотреть",
            text: "Изучите наш каталог, где представлены программы по всем ключевым направлениям: от этики и безопасности до сложных сделок с покупателями и продавцами. Выбирайте между курсами в записи для гибкого графика или онлайн-потоками для живого общения и обратной связи.",
          },
        ],
        ctaLabel: "Посмотреть все курсы",
        ctaUrl: input.links.catalogUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "student-welcome-4":
      return renderEmailLayout({
        subject: `${input.recipientName}, а что, если вы сами можете стать экспертом?`,
        preheader: "Поделитесь своими знаниями и зарабатывайте на платформе.",
        eyebrow: "Welcome 4 из 5",
        title: "От студента до эксперта: ваш путь к преподаванию!",
        intro: `Привет, ${input.recipientName}! Вы уже опытный риэлтор и накопили уникальные знания? Возможно, пришло время поделиться своим опытом с другими и стать частью нашей команды экспертов! Академия риэлторов предоставляет площадку для тех, кто готов обучать и вдохновлять.`,
        sections: [
          {
            title: "Почему это интересно",
            text: "Разместите свой авторский курс, делитесь практическими кейсами и помогайте коллегам расти. Это не только возможность укрепить свой личный бренд, но и дополнительный источник дохода. Узнайте, как это работает!",
          },
        ],
        ctaLabel: "Узнать, как стать экспертом",
        ctaUrl: input.links.expertUrl ?? input.links.signInUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "student-welcome-5":
      return renderEmailLayout({
        subject: `${input.recipientName}, готовы к реальным результатам в недвижимости?`,
        preheader: "Ваши новые знания уже ждут применения на практике.",
        eyebrow: "Welcome 5 из 5",
        title: "Максимум пользы от Академии риэлторов!",
        intro: `Привет, ${input.recipientName}! Мы верим, что обучение должно приносить реальные результаты. В Академии риэлторов вы не просто получаете знания, но и осваиваете инструменты, которые можно сразу применять в работе с клиентами и сделках.`,
        sections: [
          {
            title: "Что делать дальше",
            text: "Не откладывайте свой успех! Начните применять полученные знания уже сегодня. Если у вас возникнут вопросы или потребуется помощь, наша команда всегда готова поддержать вас. Мы здесь, чтобы помочь вам стать лучшим в своем деле!",
          },
        ],
        ctaLabel: "Начать обучение",
        ctaUrl: input.links.learningUrl,
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
        subject: `Поздравляем, ${input.recipientName}! Вы — эксперт Академии риэлторов!`,
        preheader: "Ваш статус эксперта подтвержден. Начните делиться знаниями!",
        eyebrow: "Expert welcome 1 из 3",
        title: "Добро пожаловать в команду экспертов Академии риэлторов!",
        intro: `Привет, ${input.recipientName}! Мы рады официально подтвердить ваш статус эксперта в Академии риэлторов! Это важное событие, и мы гордимся тем, что вы присоединились к нашей команде профессионалов, готовых делиться своим бесценным опытом с сообществом.`,
        sections: [
          {
            title: "Что это значит",
            text: "Ваши знания и практический опыт станут мощным ресурсом для тысяч студентов, стремящихся к успеху в недвижимости. Мы уверены, что вместе мы сможем создать уникальный образовательный контент и поднять стандарты обучения в отрасли.",
          },
        ],
        ctaLabel: "Перейти в кабинет эксперта",
        ctaUrl: input.links.expertUrl ?? input.links.signInUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "expert-welcome-2":
      return renderEmailLayout({
        subject: `${input.recipientName}, создайте свой первый курс в Академии риэлторов!`,
        preheader: "Пошаговая инструкция по запуску вашего образовательного продукта.",
        eyebrow: "Expert welcome 2 из 3",
        title: "Ваш курс на платформе: первые шаги к успеху!",
        intro: `Привет, ${input.recipientName}! Теперь, когда вы стали экспертом, пришло время поделиться своими знаниями! Создание собственного курса в Академии риэлторов — это простой и увлекательный процесс. Мы подготовили для вас пошаговое руководство, которое поможет вам запустить ваш образовательный продукт.`,
        sections: [
          {
            title: "Что делать дальше",
            text: "Начните с планирования структуры курса, подготовки материалов и записи уроков. Наша платформа предоставляет все необходимые инструменты для удобной загрузки контента и настройки продаж. Если возникнут вопросы, наша служба поддержки всегда готова помочь.",
          },
        ],
        ctaLabel: "Создать курс",
        ctaUrl: input.links.expertUrl ?? input.links.signInUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "expert-welcome-3":
      return renderEmailLayout({
        subject: `${input.recipientName}, как эффективно продвигать ваш курс и привлекать студентов?`,
        preheader: "Увеличьте охват и продажи вашего образовательного продукта.",
        eyebrow: "Expert welcome 3 из 3",
        title: "Продвигайте свой курс и расширяйте аудиторию!",
        intro: `Привет, ${input.recipientName}! Вы создали отличный курс, и теперь пришло время рассказать о нем миру! Академия риэлторов предлагает различные инструменты и возможности для продвижения вашего образовательного продукта, чтобы привлечь как можно больше студентов.`,
        sections: [
          {
            title: "Что поможет в продвижении",
            text: "Используйте наши внутренние каналы продвижения, участвуйте в совместных вебинарах и акциях. Мы также предоставим вам рекомендации по эффективному использованию социальных сетей и других внешних платформ для увеличения продаж вашего курса. Давайте вместе сделаем ваш курс успешным!",
          },
        ],
        ctaLabel: "Узнать о продвижении",
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
        subject: `Отличные новости! В Академии риэлторов появился новый курс «${input.courseTitle ?? "Новая программа"}»`,
        preheader: "Расширьте свои знания с нашей новой программой!",
        eyebrow: "Новая программа",
        title: `Представляем: новый курс «${input.courseTitle ?? "Новая программа"}»!`,
        intro: `Привет, ${input.recipientName}! Мы рады сообщить о запуске нового курса в Академии риэлторов — «${input.courseTitle ?? "Новая программа"}»! Эта программа создана, чтобы помочь вам освоить новые практические инструменты и выйти на новый уровень в вашей карьере.`,
        sections: [
          {
            title: "Что внутри",
            text: "В курсе вас ждут структурированные уроки, практические задания и материалы, которые помогут быстрее перейти от теории к применению в работе.",
          },
        ],
        ctaLabel: "Узнать подробнее и записаться",
        ctaUrl: input.links.courseUrl ?? input.links.catalogUrl,
        preferencesUrl: input.links.preferencesUrl,
        replyEmail: input.replyEmail,
      });
    case "campaign-live-intake":
      return renderEmailLayout({
        subject: `Не пропустите! ${input.courseTitle ?? "Новый поток"} уже скоро стартует`,
        preheader: "Присоединяйтесь к живому обучению и получите ответы на свои вопросы.",
        eyebrow: "Набор открыт",
        title: `Приглашаем на ${input.courseTitle ?? "новый поток"}!`,
        intro: `Привет, ${input.recipientName}! Рады пригласить вас на наш новый поток «${input.courseTitle ?? "Новый поток"}». Это возможность войти в живое обучение, задать вопросы и пройти программу вместе с группой.`,
        sections: [
          {
            title: "Почему стоит присоединиться",
            text: "Вас ждут живое общение, разбор актуальных кейсов и ответы на вопросы по теме. Количество мест может быть ограничено, поэтому лучше посмотреть программу заранее.",
          },
        ],
        ctaLabel: "Зарегистрироваться",
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
        subject: `${input.recipientName}, станьте экспертом Академии риэлторов!`,
        preheader: "Поделитесь своим опытом и создайте свой курс на нашей платформе.",
        eyebrow: "Приглашение эксперта",
        title: "Приглашаем вас стать экспертом Академии риэлторов!",
        intro: `Привет, ${input.recipientName}! Мы знаем, что у вас есть уникальный опыт и знания в сфере недвижимости, которыми вы могли бы поделиться. Академия риэлторов приглашает вас присоединиться к нашей команде экспертов и создать свой авторский курс на нашей платформе.`,
        sections: [
          {
            title: "Почему это стоит попробовать",
            text: "Это отличная возможность укрепить свой личный бренд, получить дополнительный доход и внести вклад в развитие профессионального сообщества. Мы предоставим вам все необходимые инструменты и поддержку для создания и продвижения вашего курса. Узнайте больше о возможностях для экспертов!",
          },
        ],
        ctaLabel: "Узнать о возможностях для экспертов",
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
