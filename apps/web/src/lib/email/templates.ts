type EmailSection = {
  title?: string;
  text: string;
};

type EmailTemplateInput = {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: EmailSection[];
  ctaLabel: string;
  ctaUrl: string;
  footer?: string;
};

type TransactionalAccountTemplateInput = {
  studentName: string;
  email: string;
  password: string;
  signInUrl: string;
  isExistingAccount?: boolean;
};

type CourseAccessTemplateInput = {
  studentName: string;
  courseTitle: string;
  courseUrl: string;
};

type PaymentSuccessTemplateInput = {
  studentName: string;
  courseTitle: string;
  amountLabel: string;
  learningUrl: string;
};

type MarketingTemplateInput = {
  studentName: string;
  catalogUrl: string;
  signInUrl: string;
  learningUrl: string;
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
      if (section.title) {
        return `
          <div style="margin-top:20px;">
            <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#1c2442;">${escapeHtml(section.title)}</p>
            <p style="margin:0;font-size:15px;line-height:1.8;color:#596177;">${escapeHtml(section.text)}</p>
          </div>
        `;
      }

      return `
        <p style="margin:20px 0 0;font-size:15px;line-height:1.8;color:#596177;">
          ${escapeHtml(section.text)}
        </p>
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

export function renderEmailTemplate(input: EmailTemplateInput) {
  const html = `
    <div style="margin:0;padding:32px 0;background:#f4f7ff;font-family:Arial,sans-serif;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader)}</div>
      <div style="max-width:640px;margin:0 auto;padding:0 16px;">
        <div style="overflow:hidden;border-radius:28px;border:1px solid #dbe3f3;background:#ffffff;box-shadow:0 28px 80px rgba(38,48,98,0.08);">
          <div style="padding:24px 28px;background:linear-gradient(135deg,#1a2342 0%,#3349bb 52%,#ff8f6d 100%);color:#ffffff;">
            <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,0.12);font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;">
              ${escapeHtml(input.eyebrow)}
            </div>
            <h1 style="margin:18px 0 0;font-size:34px;line-height:1.05;font-weight:800;color:#ffffff;">
              ${escapeHtml(input.title)}
            </h1>
          </div>

          <div style="padding:28px;">
            <p style="margin:0;font-size:16px;line-height:1.9;color:#596177;">
              ${escapeHtml(input.intro)}
            </p>

            ${renderSectionsHtml(input.sections)}

            <div style="margin-top:28px;">
              <a href="${input.ctaUrl}" style="display:inline-block;border-radius:999px;background:#2840db;padding:14px 22px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                ${escapeHtml(input.ctaLabel)}
              </a>
            </div>

            <p style="margin:28px 0 0;font-size:13px;line-height:1.8;color:#7a8396;">
              ${escapeHtml(
                input.footer ||
                  "Если письмо пришло не вовремя или вопрос требует живого ответа, команда платформы всегда может продолжить общение вручную.",
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  const text = [
    input.title,
    "",
    input.intro,
    "",
    renderSectionsText(input.sections),
    "",
    `${input.ctaLabel}: ${input.ctaUrl}`,
    "",
    input.footer ||
      "Если письмо пришло не вовремя или вопрос требует живого ответа, команда платформы всегда может продолжить общение вручную.",
  ].join("\n");

  return { html, text };
}

export function renderStudentAccountCreatedTemplate(
  input: TransactionalAccountTemplateInput,
) {
  const intro = input.isExistingAccount
    ? `Для ${input.studentName} обновлены данные доступа к платформе.`
    : `${input.studentName}, для вас создана учетная запись в Академии риэлторов.`;

  return renderEmailTemplate({
    preheader: "Данные доступа к платформе уже готовы.",
    eyebrow: "Доступ в платформу",
    title: input.isExistingAccount
      ? "Данные доступа обновлены"
      : "Учетная запись готова",
    intro,
    sections: [
      {
        title: "Email для входа",
        text: input.email,
      },
      {
        title: "Временный пароль",
        text: input.password,
      },
      {
        title: "Что дальше",
        text: "Откройте платформу по кнопке ниже, войдите по email и паролю и проверьте, какие курсы и материалы уже доступны в кабинете.",
      },
    ],
    ctaLabel: "Открыть платформу",
    ctaUrl: input.signInUrl,
  });
}

export function renderCourseAccessGrantedTemplate(input: CourseAccessTemplateInput) {
  return renderEmailTemplate({
    preheader: "Для вас открыт новый курс.",
    eyebrow: "Доступ к курсу",
    title: "Курс уже доступен в кабинете",
    intro: `${input.studentName}, вам открыт доступ к курсу «${input.courseTitle}».`,
    sections: [
      {
        title: "Что внутри",
        text: "В курсе могут быть видео, текстовые материалы, файлы и уроки, которые открываются сразу или по расписанию.",
      },
      {
        title: "Как проходить",
        text: "Откройте курс из личного кабинета, начните с первого урока и отмечайте прохождение по мере работы с материалами.",
      },
    ],
    ctaLabel: "Перейти к курсу",
    ctaUrl: input.courseUrl,
  });
}

export function renderPaymentSuccessTemplate(input: PaymentSuccessTemplateInput) {
  return renderEmailTemplate({
    preheader: "Оплата подтверждена, курс открыт.",
    eyebrow: "Оплата подтверждена",
    title: "Покупка прошла успешно",
    intro: `${input.studentName}, оплата курса «${input.courseTitle}» успешно завершена.`,
    sections: [
      {
        title: "Сумма оплаты",
        text: input.amountLabel,
      },
      {
        title: "Доступ уже открыт",
        text: "Курс автоматически появился в учебном кабинете, и к нему можно перейти сразу после открытия платформы.",
      },
    ],
    ctaLabel: "Открыть обучение",
    ctaUrl: input.learningUrl,
  });
}

export function renderMarketingSequenceTemplate(
  step: 1 | 2 | 3 | 4 | 5,
  input: MarketingTemplateInput,
) {
  switch (step) {
    case 1:
      return renderEmailTemplate({
        preheader: "Что уже можно делать в платформе.",
        eyebrow: "Сценарий 1 из 5",
        title: "Платформа уже готова к работе",
        intro: `${input.studentName}, в Академии риэлторов уже можно не только учиться, но и смотреть, как курс упакован, продается и открывается внутри кабинета.`,
        sections: [
          {
            title: "Что стоит посмотреть первым",
            text: "Откройте каталог и учебный кабинет. Так проще понять, как выглядит путь ученика от витрины до урока.",
          },
          {
            title: "Зачем это письмо",
            text: "Мы хотим, чтобы вы быстрее освоились в платформе и увидели не только контент, но и общую логику обучения.",
          },
        ],
        ctaLabel: "Открыть каталог",
        ctaUrl: input.catalogUrl,
      });
    case 2:
      return renderEmailTemplate({
        preheader: "Как устроен путь студента внутри платформы.",
        eyebrow: "Сценарий 2 из 5",
        title: "Уроки, прогресс и доступы работают вместе",
        intro: "Внутри кабинета студент видит не хаотичный набор файлов, а маршрут: курс, модули, уроки, материалы и следующий шаг.",
        sections: [
          {
            title: "Что это дает",
            text: "Даже большой курс остается понятным, если у ученика есть ясный список модулей, прогресс и открывающиеся по логике уроки.",
          },
          {
            title: "Что проверить",
            text: "Откройте учебный кабинет и посмотрите, как платформа ведет пользователя внутри обучения.",
          },
        ],
        ctaLabel: "Открыть кабинет",
        ctaUrl: input.learningUrl,
      });
    case 3:
      return renderEmailTemplate({
        preheader: "Курс можно продавать как продукт.",
        eyebrow: "Сценарий 3 из 5",
        title: "У курса должен быть не только контент, но и упаковка",
        intro: "Витрина, карточка курса, цена, checkout и выдача доступа должны выглядеть как один продуктовый поток. Тогда платформа начинает работать на продажи.",
        sections: [
          {
            title: "Почему это важно",
            text: "Пользователь покупает не список уроков, а понятный результат, доверие к продукту и удобный следующий шаг после оплаты.",
          },
          {
            title: "Что посмотреть",
            text: "Перейдите в каталог и оцените, насколько курс выглядит как самостоятельный цифровой продукт.",
          },
        ],
        ctaLabel: "Посмотреть витрину",
        ctaUrl: input.catalogUrl,
      });
    case 4:
      return renderEmailTemplate({
        preheader: "Платформа подходит и для живых запусков.",
        eyebrow: "Сценарий 4 из 5",
        title: "Курсы и вебинары можно держать рядом",
        intro: "Платформа строится не только как архив уроков, но и как база для эфиров, разборов и запусков с последующей продажей записи.",
        sections: [
          {
            title: "Что это значит для школы",
            text: "Не нужно держать курсы отдельно, каталог отдельно и эфиры отдельно. Один контур может обслуживать сразу несколько форматов обучения.",
          },
          {
            title: "Как использовать",
            text: "Такой подход особенно полезен, если у вас есть авторские программы, групповые разборы и сценарии сопровождения студентов.",
          },
        ],
        ctaLabel: "Вернуться в платформу",
        ctaUrl: input.signInUrl,
      });
    case 5:
      return renderEmailTemplate({
        preheader: "Финальный шаг: выбрать курс и зайти в работу.",
        eyebrow: "Сценарий 5 из 5",
        title: "Пора открыть первый курс и пройти путь до конца",
        intro: "Если вы еще не выбрали программу, сейчас лучший момент открыть каталог, посмотреть карточки курсов и зайти в тот сценарий, который ближе вашей задаче.",
        sections: [
          {
            title: "Что сделать сейчас",
            text: "Откройте каталог, выберите курс и проверьте, как выглядит путь покупки, доступа и прохождения внутри кабинета.",
          },
          {
            title: "Если нужен живой сценарий",
            text: "Команда платформы всегда может продолжить общение вручную и подобрать формат: курс, запуск, вебинар или смешанную модель.",
          },
        ],
        ctaLabel: "Выбрать курс",
        ctaUrl: input.catalogUrl,
      });
  }
}
