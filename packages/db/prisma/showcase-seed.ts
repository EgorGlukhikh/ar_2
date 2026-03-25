import {
  CourseStatus,
  LessonType,
  Prisma,
  UserRole,
  prisma,
} from "../src/index.js";

type LessonBlock =
  | {
      id: string;
      type: "TEXT";
      title: string;
      body: string;
    }
  | {
      id: string;
      type: "FILE";
      title: string;
      url: string;
      note?: string;
    }
  | {
      id: string;
      type: "HOMEWORK";
      title: string;
      body: string;
      submissionHint?: string;
    };

type ShowcaseLesson = {
  title: string;
  excerpt: string;
  isPreview?: boolean;
  blocks: LessonBlock[];
  homeworkSettings?: {
    requiresCuratorReview?: boolean;
    unlockNextModuleOnApproval?: boolean;
    allowTextSubmission?: boolean;
    allowLinkSubmission?: boolean;
    allowFileUpload?: boolean;
  };
};

type ShowcaseCourse = {
  slug: string;
  title: string;
  description: string;
  offer: {
    name: string;
    description: string;
    amount: number;
    currency: string;
    isActive: boolean;
  };
  moduleTitle: string;
  lessons: ShowcaseLesson[];
};

function normalizeLessonBlocks(blocks: LessonBlock[]) {
  return blocks
    .map((block, index) => {
      const title = block.title.trim();

      if (block.type === "TEXT") {
        return {
          id: block.id.trim() || `block-${index + 1}`,
          type: "TEXT" as const,
          title,
          body: block.body.trim(),
        };
      }

      if (block.type === "HOMEWORK") {
        return {
          id: block.id.trim() || `block-${index + 1}`,
          type: "HOMEWORK" as const,
          title,
          body: block.body.trim(),
          submissionHint: block.submissionHint?.trim() || "",
        };
      }

      const url = block.url.trim();

      if (!url) {
        return null;
      }

      return {
        id: block.id.trim() || `block-${index + 1}`,
        type: "FILE" as const,
        title,
        url,
        note: block.note?.trim() || "",
      };
    })
    .flatMap((block) => (block ? [block] : []));
}

function buildLessonContentFromBlocks(blocks: LessonBlock[]) {
  const normalizedBlocks = normalizeLessonBlocks(blocks);

  return normalizedBlocks.length > 0
    ? ({
        blocks: normalizedBlocks,
      } satisfies Prisma.InputJsonObject)
    : null;
}

function buildPersistedLessonBlocks(blocks: LessonBlock[]) {
  return normalizeLessonBlocks(blocks).map((block, index) => ({
    blockKey: block.id,
    type: block.type,
    position: index + 1,
    title: block.title,
    body: block.type === "TEXT" || block.type === "HOMEWORK" ? block.body : null,
    url: block.type === "FILE" ? block.url : null,
    note: block.type === "FILE" ? block.note ?? "" : null,
    submissionHint: block.type === "HOMEWORK" ? block.submissionHint ?? "" : null,
  }));
}

function resolveLessonType(blocks: LessonBlock[]) {
  if (blocks.some((block) => block.type === "HOMEWORK")) {
    return LessonType.HOMEWORK;
  }

  if (blocks.some((block) => block.type === "FILE")) {
    return LessonType.FILE;
  }

  return LessonType.TEXT;
}

const SOURCE_URLS = {
  firstHome: "https://www.nar.realtor/the-facts/consumer-guide-buying-your-first-home",
  buyerAgreement:
    "https://www.nar.realtor/the-facts/consumer-guide-to-written-buyer-agreements",
  homeInspection: "https://www.nar.realtor/the-facts/consumer-guide-home-inspections",
  multipleOffers:
    "https://www.nar.realtor/the-facts/consumer-guide-navigating-multiple-offers",
  sellerChecklist:
    "https://www.nar.realtor/the-facts/consumer-guide-seller-checklist-15-things-to-do-before-every-showing",
  privacySafety:
    "https://www.nar.realtor/the-facts/consumer-guide-home-selling-tips-for-privacy-and-safety",
  fairHousing: "https://www.hud.gov/helping-americans/fair-housing-act-overview",
  closeTheDeal: "https://www.consumerfinance.gov/owning-a-home/close/close-the-deal/",
} as const;

const showcaseCourses: ShowcaseCourse[] = [
  {
    slug: "rieltor-client-intake",
    title: "Первые 10 дней риэлтора: бриф клиента и маршрут сделки",
    description:
      "Бесплатный вводный курс для автора и команды: как провести первый контакт, собрать реальный бриф и не потерять клиента между звонком, показами и оффером.",
    offer: {
      name: "Бесплатный стартовый курс",
      description:
        "Открытый вводный трек по первичному клиентскому брифу и базовой логике сопровождения сделки.",
      amount: 0,
      currency: "RUB",
      isActive: true,
    },
    moduleTitle: "Стартовый трек",
    lessons: [
      {
        title: "Первый созвон: доверие, ожидания и следующий шаг",
        excerpt:
          "Как еще на первом контакте показать структуру работы, а не просто назначить просмотр.",
        isPreview: true,
        blocks: [
          {
            id: "intake-1-main",
            type: "TEXT",
            title: "Что должен дать первый созвон",
            body:
              "Первый созвон нужен не для того, чтобы сразу продавать объект, а чтобы собрать контекст: кто клиент, на каком этапе он находится, сколько времени у него есть, какие критерии обязательны и какой формат сопровождения ему нужен. Хороший риэлтор уже на этом этапе обозначает рамку: как строятся показы, когда фиксируются критерии, как обсуждаются офферы и кто за что отвечает.\n\nЕсли клиент покупает первую квартиру, ему особенно важны ясность и ощущение, что путь разбит на понятные шаги. Поэтому в разговоре полезно сразу проговорить: что будет до первого показа, когда появится shortlist, что нужно подготовить по бюджету и когда имеет смысл переходить к переговорам.",
          },
          {
            id: "intake-1-source",
            type: "FILE",
            title: "Открытый материал NAR о старте работы с покупателем",
            url: SOURCE_URLS.firstHome,
            note: "Основа для вводного сценария и ожиданий клиента на старте.",
          },
        ],
      },
      {
        title: "Бриф покупателя: бюджет, район, сроки и запреты",
        excerpt:
          "Из чего состоит рабочий бриф, по которому потом реально можно искать объект и вести клиента.",
        blocks: [
          {
            id: "intake-2-main",
            type: "TEXT",
            title: "Четыре обязательных слоя брифа",
            body:
              "Рабочий бриф должен отвечать минимум на четыре группы вопросов. Первая группа: бюджет и источник средств, включая ипотеку, субсидии, первый взнос и запас на сопутствующие расходы. Вторая: география и обязательные характеристики объекта. Третья: сроки сделки, переезда и допустимые компромиссы. Четвертая: стоп-факторы, из-за которых объект не рассматривается вообще.\n\nЕсли риэлтор не разложил запрос на эти слои, показы превращаются в хаотичное \"давайте посмотрим еще\". Если же бриф собран хорошо, клиент быстрее принимает решения, а риэлтор может объяснять, почему конкретный объект подходит или не подходит по заранее согласованным критериям.",
          },
          {
            id: "intake-2-source",
            type: "FILE",
            title: "Открытый материал NAR о первом жилье и программах поддержки",
            url: SOURCE_URLS.firstHome,
            note: "Использован для блока про бюджет, льготы и финансовые ограничения.",
          },
        ],
      },
      {
        title: "Buyer agreement и карта сервиса без размытых обещаний",
        excerpt:
          "Как объяснять клиенту формат работы, зоны ответственности и договоренности до первого тура.",
        blocks: [
          {
            id: "intake-3-main",
            type: "TEXT",
            title: "Что должно быть определено заранее",
            body:
              "Даже если рынок и юрисдикция отличаются, клиенту полезно видеть зафиксированный объем сервиса: как долго агент сопровождает поиск, какие действия входят в работу, как строится коммуникация и как обсуждается компенсация. Такой подход снижает хаос и дает опору и риэлтору, и клиенту.\n\nВажно не обещать \"все под ключ\" без рамки. Гораздо сильнее работает конкретика: я фильтрую рынок по вашему брифу, веду показы, фиксирую обратную связь, помогаю готовить оффер, координирую проверку объекта и веду вас до сделки. Чем раньше это проговорено, тем меньше недопонимания на этапе торга.",
          },
          {
            id: "intake-3-source",
            type: "FILE",
            title: "Consumer Guide to Written Buyer Agreements",
            url: SOURCE_URLS.buyerAgreement,
            note: "Основа для структуры сервиса, переговорности условий и понятных рамок работы.",
          },
        ],
      },
      {
        title: "Подготовка к офферу: уступки, расходы и развилка решений",
        excerpt:
          "Что клиент должен понимать до момента, когда ему понравился объект.",
        blocks: [
          {
            id: "intake-4-main",
            type: "TEXT",
            title: "Что проговариваем до подачи оффера",
            body:
              "До оффера клиент должен понимать не только желаемую цену, но и весь пакет условий: срок закрытия, возможные уступки продавца, расходы на сделку, сценарий при выявлении дефектов и предел собственной гибкости. Это особенно важно для первого покупателя, который часто фокусируется на одной цифре и недооценивает структуру расходов.\n\nРоль риэлтора здесь не в том, чтобы принять решение за клиента, а в том, чтобы перевести эмоцию в список проверяемых условий. Тогда даже напряженные переговоры не выглядят хаосом: у клиента есть приоритеты, а у агента есть ясный диапазон, в котором можно торговаться.",
          },
          {
            id: "intake-4-source",
            type: "FILE",
            title: "Материал NAR про снижение первоначальной нагрузки покупателя",
            url: SOURCE_URLS.firstHome,
            note: "Использован для блока про concessions и структуру расходов покупателя.",
          },
        ],
      },
      {
        title: "Мини-тест: первый контакт и бриф клиента",
        excerpt:
          "Финальный тест по стартовому сценарию работы с покупателем.",
        blocks: [
          {
            id: "intake-5-homework",
            type: "HOMEWORK",
            title: "Проверка понимания",
            body:
              "Ответь на вопросы коротко, в формате `1A, 2B...` и добавь 2-3 предложения, как ты бы провел первый созвон.\n\n1. Что лучше всего фиксировать уже на первом контакте, кроме желаемой цены?\nA. Только площадь\nB. Бюджет, сроки, ограничения и критерии выбора\nC. Только адреса понравившихся домов\n\n2. Зачем заранее объяснять карту сервиса?\nA. Чтобы было меньше неопределенности и размытых ожиданий\nB. Только ради формальности\nC. Чтобы не вести переписку\n\n3. Что из этого относится к подготовке к офферу?\nA. Только выбор цвета стен\nB. Сроки, уступки, расходы и предел торга\nC. Только дата показа\n\n4. Почему хороший бриф ускоряет сделку?\nA. Уменьшает хаотичные показы и помогает сравнивать объекты по критериям\nB. Делает все объекты одинаковыми\nC. Убирает необходимость в переговорах\n\n5. Какой стиль коммуникации на старте сильнее всего повышает доверие?\nA. Абстрактные обещания без рамки\nB. Понятная последовательность шагов и прозрачные договоренности\nC. Максимально длинные голосовые без структуры",
            submissionHint:
              "Можно сдать как текст. Формат ответа: 1B, 2A, 3B... Затем коротко опиши свой сценарий первого созвона.",
          },
        ],
        homeworkSettings: {
          requiresCuratorReview: false,
          unlockNextModuleOnApproval: false,
          allowTextSubmission: true,
          allowLinkSubmission: false,
          allowFileUpload: false,
        },
      },
    ],
  },
  {
    slug: "seller-listing-system",
    title: "Листинг продавца: подготовка объекта, показы и multiple offers",
    description:
      "Практический курс для автора: как вести продавца от постановки объекта в работу до показов, безопасности собственника и разбора офферов.",
    offer: {
      name: "Практикум по листингу",
      description:
        "Платный курс о подготовке объекта, сценариях показов и переговорах при нескольких предложениях.",
      amount: 249000,
      currency: "RUB",
      isActive: true,
    },
    moduleTitle: "Листинг и переговоры",
    lessons: [
      {
        title: "Старт листинга: цель собственника и рамка сделки",
        excerpt:
          "Как собрать у продавца не только цену ожидания, но и реальные ограничения по сроку и формату сделки.",
        isPreview: true,
        blocks: [
          {
            id: "seller-1-main",
            type: "TEXT",
            title: "Что важно выяснить до выхода в рекламу",
            body:
              "До запуска объекта важно понять не только желаемую цену, но и мотивацию продавца, дедлайн, допустимый формат оплаты, готовность к уступкам и риски, которые для него критичны. Один собственник готов ждать лучшую цену, другой ценит быстрый выход на сделку, третий не хочет цепочку с ипотекой. Без этого агент не сможет корректно оценивать входящие предложения.\n\nУже на старте полезно проговорить правила: как готовится объект, как согласуются показы, как собирается обратная связь и как принимается решение по офферам. Это снижает эмоциональные качели и делает риэлтора не \"передатчиком звонков\", а управляющим процесса.",
          },
          {
            id: "seller-1-source",
            type: "FILE",
            title: "Материал NAR по выбору лучшего оффера",
            url: SOURCE_URLS.multipleOffers,
            note: "Использован для логики оценки предложения не только по цене.",
          },
        ],
      },
      {
        title: "Подготовка объекта к показам: чек-лист без суеты",
        excerpt:
          "Какие действия реально повышают качество показа и впечатление покупателя.",
        blocks: [
          {
            id: "seller-2-main",
            type: "TEXT",
            title: "Перед каждым показом важны мелочи",
            body:
              "Покупатель оценивает не только квадратные метры, но и ощущение от пространства. Поэтому перед показом важно убрать вещи с проходов, очистить поверхности, освободить визуальный шум на кухне и в санузле, проверить зеркала, заменить бытовые полотенца на нейтральные и включить свет. Чистота, запах и порядок сильно влияют на то, как объект воспринимается эмоционально.\n\nРиэлтору полезно превратить этот набор действий в стабильный чек-лист для собственника. Тогда показ перестает зависеть от настроения и происходит по повторяемому стандарту.",
          },
          {
            id: "seller-2-source",
            type: "FILE",
            title: "Seller Checklist: 15 Things to Do Before Every Showing",
            url: SOURCE_URLS.sellerChecklist,
            note: "Открытый чек-лист NAR по подготовке дома к показам.",
          },
        ],
      },
      {
        title: "Безопасность собственника: фото, ценности, доступ",
        excerpt:
          "Как готовить объект к показам так, чтобы маркетинг не создавал лишних рисков.",
        blocks: [
          {
            id: "seller-3-main",
            type: "TEXT",
            title: "Что обязательно убрать до показа",
            body:
              "На объекте не должно оставаться того, что раскрывает лишнюю личную информацию: семейные фото, календари, письма, документы, логины, пароли Wi‑Fi и все, что может быть использовано не по назначению. Отдельно нужно убрать или запереть украшения, лекарства, оружие, редкие предметы и чувствительные бумаги.\n\nЕсли собственник допускает маркетинг с фото и видео, важно дополнительно договориться о правилах доступа и съемки во время визитов. Корректный риэлтор заранее предупреждает про ограничения по фотографированию и контролирует, кто и когда получил доступ к объекту.",
          },
          {
            id: "seller-3-source",
            type: "FILE",
            title: "Home Selling Tips for Privacy and Safety",
            url: SOURCE_URLS.privacySafety,
            note: "Открытый материал NAR о конфиденциальности, valuables и безопасном доступе.",
          },
        ],
      },
      {
        title: "Разбор офферов: сильное предложение не всегда самое дорогое",
        excerpt:
          "Как объяснять продавцу разницу между ценой, сроком, contingencies и надежностью покупателя.",
        blocks: [
          {
            id: "seller-4-main",
            type: "TEXT",
            title: "Сравниваем офферы по матрице, а не по эмоции",
            body:
              "При нескольких предложениях продавец часто смотрит только на верхнюю цифру. Но агенту важно раскладывать каждый оффер по нескольким параметрам: цена, источник денег, наличие или отсутствие условий, депозит, срок закрытия, вероятность срыва и управляемость коммуникации. Самое высокое предложение может оказаться самым рискованным.\n\nТак же важно объяснить механику контроффера. Если продавец отвечает встречными условиями, исходный оффер перестает существовать в прежнем виде. Поэтому переговоры надо вести осознанно: понимать, где мы усиливаем позицию, а где рискуем потерять дисциплинированного покупателя.",
          },
          {
            id: "seller-4-source",
            type: "FILE",
            title: "Consumer Guide: Navigating Multiple Offers",
            url: SOURCE_URLS.multipleOffers,
            note: "Основа для объяснения цены, timeline, contingencies и counteroffer.",
          },
        ],
      },
      {
        title: "Тест: подготовка листинга и переговоры",
        excerpt:
          "Финальная проверка по логике листинга, показов и оценки предложений.",
        blocks: [
          {
            id: "seller-5-homework",
            type: "HOMEWORK",
            title: "Контрольный тест по листингу",
            body:
              "Ответь в формате `1A, 2C...`, а затем опиши, как бы ты сравнил два оффера продавцу.\n\n1. Что сильнее всего снижает качество показа?\nA. Четкий чек-лист подготовки\nB. Визуальный шум, запахи и плохой свет\nC. Наличие описания квартиры\n\n2. Что нужно убрать из объекта в первую очередь перед показами?\nA. Только шторы\nB. Личные данные, документы, ценности и лекарства\nC. Только цветы\n\n3. Почему самое дорогое предложение не всегда лучшее?\nA. Потому что цена вообще не важна\nB. Потому что есть еще сроки, условия, финансирование и риск срыва\nC. Потому что продавцу нельзя выбирать\n\n4. Что происходит, когда продавец отправляет контроффер?\nA. Исходный оффер продолжает действовать без изменений\nB. Исходный оффер в прежнем виде больше не действует\nC. Сделка закрывается автоматически\n\n5. Что должен делать агент при нескольких предложениях?\nA. Давить на клиента принять первое попавшееся\nB. Разложить офферы по матрице критериев и привязать к цели продавца\nC. Скрыть часть условий для ускорения сделки",
            submissionHint:
              "В конце добавь короткую матрицу сравнения офферов: цена, срок, условия, риск срыва.",
          },
        ],
        homeworkSettings: {
          requiresCuratorReview: false,
          unlockNextModuleOnApproval: false,
          allowTextSubmission: true,
          allowLinkSubmission: false,
          allowFileUpload: false,
        },
      },
    ],
  },
  {
    slug: "buyer-deal-finance-closing",
    title: "Сделка с покупателем: финансирование, inspection и closing",
    description:
      "Платный курс о покупательской сделке: как вести клиента от бюджета и buyer agreement до инспекции, оффера и финального закрытия.",
    offer: {
      name: "Покупательская сделка под ключ",
      description:
        "Платный трек про финансы покупателя, инспекцию, документы и closing без потери контроля.",
      amount: 349000,
      currency: "RUB",
      isActive: true,
    },
    moduleTitle: "Путь покупателя",
    lessons: [
      {
        title: "Финансирование: что нужно проверить до тура",
        excerpt:
          "Как не вести клиента на показы, пока не понятен бюджет, взнос и источник денег.",
        isPreview: true,
        blocks: [
          {
            id: "buyer-1-main",
            type: "TEXT",
            title: "Проверяем платежеспособность заранее",
            body:
              "До активного поиска агенту важно вместе с клиентом понять реалистичный бюджет: есть ли первоначальный взнос, нужна ли ипотека, какие программы поддержки доступны и сколько денег останется на closing costs и сопровождение. Это не формальность, а основа всей стратегии покупки.\n\nКогда бюджет прозрачен, риэлтор точнее фильтрует рынок и увереннее ведет переговоры. Когда бюджет расплывчат, клиент легко уходит в объекты выше возможностей и разочаровывается уже после эмоционально сильного показа.",
          },
          {
            id: "buyer-1-source",
            type: "FILE",
            title: "Buying Your First Home",
            url: SOURCE_URLS.firstHome,
            note: "Открытый материал NAR о программах финансирования, субсидиях и cost burden.",
          },
        ],
      },
      {
        title: "Buyer agreement: сервис, сроки и переговорность условий",
        excerpt:
          "Как объяснить клиенту, что именно делает агент и как фиксируются рамки сотрудничества.",
        blocks: [
          {
            id: "buyer-2-main",
            type: "TEXT",
            title: "Фиксируем рамку до первого тура",
            body:
              "Покупателю важно понимать, какие услуги агент оказывает и как долго действует договоренность. Формат может различаться по рынкам и юрисдикциям, но логика одна: услуги, срок сотрудничества, компенсация и правила выхода должны быть понятны до начала интенсивной работы.\n\nДля риэлтора это защита от размытых ожиданий, а для клиента — прозрачность. Четкая рамка делает отношения взрослыми: клиент понимает, за что платит, а агент понимает, где заканчивается зона ответственности.",
          },
          {
            id: "buyer-2-source",
            type: "FILE",
            title: "Consumer Guide to Written Buyer Agreements",
            url: SOURCE_URLS.buyerAgreement,
            note: "Использован для логики negotiable terms, services и compensation.",
          },
        ],
      },
      {
        title: "Inspection: contingencies, red flags и здравый смысл",
        excerpt:
          "Как готовить клиента к инспекции и решениям после отчета инспектора.",
        blocks: [
          {
            id: "buyer-3-main",
            type: "TEXT",
            title: "Инспекция — это не стоп-кран, а инструмент решения",
            body:
              "Инспекция помогает понять фактическое состояние объекта и выявить проблемы, которые покупатель мог не заметить на показе: фундамент, дренаж, проводка, HVAC, безопасность, плесень или другие риски. Сам факт замечаний в отчете не означает, что сделка должна развалиться. Важно отделить критичные риски от нормального износа.\n\nРиэлтор помогает клиенту принять решение в трех плоскостях: продолжаем без изменений, просим исправления или уступки, либо выходим из сделки, если риск неприемлем. Тогда inspection перестает быть страшным сюрпризом и становится управляемой точкой переговоров.",
          },
          {
            id: "buyer-3-source",
            type: "FILE",
            title: "Consumer Guide: Home Inspections",
            url: SOURCE_URLS.homeInspection,
            note: "Основа для объяснения inspection contingency, red flags и участия покупателя в осмотре.",
          },
        ],
      },
      {
        title: "Closing: final walk-through, документы и право задавать вопросы",
        excerpt:
          "Что риэлтор должен проговорить с клиентом перед подписанием документов и выдачей ключей.",
        blocks: [
          {
            id: "buyer-4-main",
            type: "TEXT",
            title: "Финал сделки без суеты",
            body:
              "Перед closing клиенту важно пройти финальную проверку объекта: убедиться, что согласованные ремонты выполнены, а все обещанные элементы остались на месте. На самом closing нельзя торопить покупателя. Его право — спокойно прочитать документы, сверить суммы и задать вопросы, если что-то отличается от ожидаемого.\n\nСильный агент не просто напоминает о времени сделки, а заранее ведет чек-лист: документы, окончательный маршрут денег, контакты сторон и сценарий, если цифры или формулировки неожиданно меняются в последний момент.",
          },
          {
            id: "buyer-4-source",
            type: "FILE",
            title: "CFPB: Close the deal",
            url: SOURCE_URLS.closeTheDeal,
            note: "Открытый материал CFPB про final walk-through, review документов и closing checklist.",
          },
        ],
      },
      {
        title: "Тест: от бюджета до closing",
        excerpt:
          "Финальный тест по buyer journey: финансирование, inspection и closing.",
        blocks: [
          {
            id: "buyer-5-homework",
            type: "HOMEWORK",
            title: "Контрольный тест по покупательской сделке",
            body:
              "Ответь в формате `1B, 2A...` и добавь короткий план своих действий после слабого inspection report.\n\n1. Почему бюджет нужно прояснять до туров?\nA. Чтобы не показывать клиенту объекты, которые он не сможет купить\nB. Чтобы исключить все переговоры\nC. Чтобы не обсуждать субсидии\n\n2. Что делает buyer agreement полезным?\nA. Делает компенсацию неясной\nB. Фиксирует услуги, рамку и договоренности между агентом и клиентом\nC. Заменяет весь процесс сделки\n\n3. Для чего нужна home inspection contingency?\nA. Чтобы автоматически повысить цену\nB. Чтобы у покупателя была точка оценки риска перед продолжением сделки\nC. Чтобы запретить переговоры\n\n4. Что важно сделать перед closing?\nA. Только взять ручку\nB. Провести final walk-through и сверить документы с ожиданиями\nC. Сразу подписать все, не читая\n\n5. Что должен сделать агент, если цифры на closing неожиданно отличаются?\nA. Сказать клиенту подписывать быстрее\nB. Помочь остановиться, задать вопросы и разобраться до подписи\nC. Игнорировать расхождения",
            submissionHint:
              "После ответов напиши 4-5 пунктов: как ты проводишь клиента через inspection report и подготовку к closing.",
          },
        ],
        homeworkSettings: {
          requiresCuratorReview: false,
          unlockNextModuleOnApproval: false,
          allowTextSubmission: true,
          allowLinkSubmission: false,
          allowFileUpload: false,
        },
      },
    ],
  },
  {
    slug: "ethics-safety-real-estate",
    title: "Этика и безопасность в недвижимости: fair housing, privacy и доверие",
    description:
      "Бесплатный курс для команды и автора: как вести коммуникацию без дискриминации, защищать данные клиента и безопасно проводить показы.",
    offer: {
      name: "Бесплатный курс по этике и безопасности",
      description:
        "Открытый курс по fair housing, безопасным показам и защите конфиденциальности клиента.",
      amount: 0,
      currency: "RUB",
      isActive: true,
    },
    moduleTitle: "Этика и безопасность",
    lessons: [
      {
        title: "Fair housing: что агенту нельзя нарушать",
        excerpt:
          "Базовый урок о защищенных категориях и недопустимой дискриминации в жилищных сценариях.",
        isPreview: true,
        blocks: [
          {
            id: "ethics-1-main",
            type: "TEXT",
            title: "Основа равного доступа",
            body:
              "Базовый принцип fair housing прост: нельзя создавать неравный доступ к жилью из-за защищенных характеристик человека. В открытых материалах HUD отдельно подчеркивается, что защита распространяется на покупку, аренду, ипотеку, поиск помощи и другие связанные с жильем действия.\n\nДля риэлтора это означает очень практичную вещь: мы не фильтруем клиентов и объекты по предвзятым критериям, не делаем дискриминационные формулировки в рекламе и не направляем человека в сценарий \"вам этот район не подойдет\" по признакам, не связанным с его запросом и объектом.",
          },
          {
            id: "ethics-1-source",
            type: "FILE",
            title: "HUD Fair Housing Act Overview",
            url: SOURCE_URLS.fairHousing,
            note: "Открытый источник HUD по protected classes и core rights.",
          },
        ],
      },
      {
        title: "Как говорить о районе, доме и клиенте без дискриминации",
        excerpt:
          "Как заменить рискованные формулировки на профессиональный язык критериев и фактов.",
        blocks: [
          {
            id: "ethics-2-main",
            type: "TEXT",
            title: "Фокус на объекте и запросе, а не на ярлыках",
            body:
              "Безопасная профессиональная коммуникация строится на фактах: параметры дома, инфраструктура, транспорт, бюджет, срок сделки, юридическое состояние объекта. Риск появляется там, где агент начинает подменять критерии клиента собственными предположениями о \"подходящем\" покупателе, семье или образе жизни.\n\nЕсли клиент задает чувствительный вопрос, задача агента — вернуть разговор к проверяемым характеристикам и открытым источникам данных. Это защищает и клиента, и самого риэлтора.",
          },
          {
            id: "ethics-2-source",
            type: "FILE",
            title: "Fair Housing Act Overview",
            url: SOURCE_URLS.fairHousing,
            note: "Использован как правовая рамка для недискриминационной коммуникации.",
          },
        ],
      },
      {
        title: "Конфиденциальность на объекте: фото, документы и личные следы",
        excerpt:
          "Что должно исчезнуть из квартиры до съемки, показа и инспекции.",
        blocks: [
          {
            id: "ethics-3-main",
            type: "TEXT",
            title: "Объект не должен раскрывать лишнего",
            body:
              "При продаже квартиры внутри легко остаются следы, которые не имеют отношения к самой сделке, но раскрывают личную жизнь собственника: фотографии, почта, документы, логины, заметки, пароли, награды, детские материалы. В открытых рекомендациях NAR подчеркивается, что все это лучше убрать заранее, потому что в процессе продажи объект может снимать фотограф, appraiser, inspector, подрядчик и сами потенциальные покупатели.\n\nРиэлтору полезно включать этот блок в обязательную подготовку к маркетингу. Тогда безопасность не зависит от внимательности собственника в последний момент.",
          },
          {
            id: "ethics-3-source",
            type: "FILE",
            title: "Home Selling Tips for Privacy and Safety",
            url: SOURCE_URLS.privacySafety,
            note: "Открытый материал NAR о personal items, documents and photos.",
          },
        ],
      },
      {
        title: "Безопасный showing: ценности, фото и контроль доступа",
        excerpt:
          "Как сделать показы удобными для покупателей, но безопасными для собственника.",
        blocks: [
          {
            id: "ethics-4-main",
            type: "TEXT",
            title: "Showing etiquette с учетом риска",
            body:
              "Безопасный показ — это не только присутствие агента, но и понятные правила доступа. До показа должны быть убраны ценности, лекарства и чувствительные документы. Дополнительно стоит заранее обозначить ограничения на несанкционированную съемку и, если используется lockbox, понимать, кто получил доступ и когда.\n\nТакая дисциплина не ухудшает клиентский опыт. Наоборот, она показывает, что агент умеет одновременно беречь интересы продавца и организовывать процесс без хаоса.",
          },
          {
            id: "ethics-4-source",
            type: "FILE",
            title: "NAR guide on privacy and safe access",
            url: SOURCE_URLS.privacySafety,
            note: "Использован для блока про valuables, photography and electronic lockbox.",
          },
        ],
      },
      {
        title: "Тест: этика, безопасность и fair housing",
        excerpt:
          "Финальная проверка по этической коммуникации и безопасным показам.",
        blocks: [
          {
            id: "ethics-5-homework",
            type: "HOMEWORK",
            title: "Контрольный тест по этике и безопасности",
            body:
              "Ответь в формате `1A, 2B...` и приведи 2 примера, как ты бы переформулировал рискованную фразу агента.\n\n1. Что является правильной базой для описания объекта клиенту?\nA. Предположения о том, какие люди должны жить в районе\nB. Проверяемые характеристики дома и условия сделки\nC. Личные взгляды агента\n\n2. Что нужно убрать из квартиры до маркетинга и показов?\nA. Только телевизор\nB. Фото, документы, логины, ценности и чувствительные вещи\nC. Только растения\n\n3. Почему контроль фотографии на показах важен?\nA. Потому что съемка может зафиксировать личные данные и чувствительные зоны объекта\nB. Потому что фото всегда незаконны\nC. Потому что покупатель не должен смотреть квартиру\n\n4. Что запрещает fair housing логика?\nA. Дискриминацию при покупке, аренде, ипотеке и related activities\nB. Любые переговоры о цене\nC. Публикацию объявлений\n\n5. Как сильнее всего проявляется зрелая роль агента?\nA. В умении сочетать сервис, безопасность и недискриминационную коммуникацию\nB. В игнорировании рисков ради скорости\nC. В использовании шаблонных ярлыков про клиентов",
            submissionHint:
              "После ответов добавь два примера: как заменить рискованные формулировки на профессиональные и нейтральные.",
          },
        ],
        homeworkSettings: {
          requiresCuratorReview: false,
          unlockNextModuleOnApproval: false,
          allowTextSubmission: true,
          allowLinkSubmission: false,
          allowFileUpload: false,
        },
      },
    ],
  },
];

async function upsertDefaultPrice(productId: string, amount: number, currency: string) {
  const existingDefaultPrice = await prisma.price.findFirst({
    where: {
      productId,
      isDefault: true,
    },
    select: {
      id: true,
    },
  });

  if (existingDefaultPrice) {
    await prisma.price.update({
      where: {
        id: existingDefaultPrice.id,
      },
      data: {
        amount,
        currency,
        isDefault: true,
      },
    });

    return;
  }

  await prisma.price.create({
    data: {
      productId,
      amount,
      currency,
      isDefault: true,
    },
  });
}

async function findShowcaseAuthor(preferredEmail?: string | null) {
  const candidates = [preferredEmail?.trim().toLowerCase(), "hp@mail.ru"].filter(
    (value): value is string => Boolean(value),
  );

  for (const email of candidates) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (user?.role === UserRole.AUTHOR) {
      return user;
    }
  }

  return prisma.user.findFirst({
    where: {
      role: UserRole.AUTHOR,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });
}

export async function seedShowcaseAcademy(preferredAuthorEmail?: string | null) {
  const author = await findShowcaseAuthor(preferredAuthorEmail);

  if (!author) {
    console.log("[seed] Showcase catalog skipped because no AUTHOR user was found.");
    return;
  }

  for (const courseDefinition of showcaseCourses) {
    const course = await prisma.course.upsert({
      where: {
        slug: courseDefinition.slug,
      },
      create: {
        slug: courseDefinition.slug,
        title: courseDefinition.title,
        description: courseDefinition.description,
        status: CourseStatus.PUBLISHED,
        authorId: author.id,
      },
      update: {
        title: courseDefinition.title,
        description: courseDefinition.description,
        status: CourseStatus.PUBLISHED,
        authorId: author.id,
      },
      select: {
        id: true,
      },
    });

    await prisma.module.deleteMany({
      where: {
        courseId: course.id,
      },
    });

    await prisma.module.create({
      data: {
        courseId: course.id,
        title: courseDefinition.moduleTitle,
        position: 1,
        lessons: {
          create: courseDefinition.lessons.map((lesson, lessonIndex) => {
            const blocks = lesson.blocks;
            const persistedBlocks = buildPersistedLessonBlocks(blocks);
            const content = buildLessonContentFromBlocks(blocks);
            const homeworkBlock = blocks.find(
              (block): block is Extract<LessonBlock, { type: "HOMEWORK" }> =>
                block.type === "HOMEWORK",
            );

            return {
              title: lesson.title,
              excerpt: lesson.excerpt,
              type: resolveLessonType(blocks),
              position: lessonIndex + 1,
              isPreview: lesson.isPreview ?? false,
              accessAfterDays: null,
              content: content ?? Prisma.JsonNull,
              lessonBlocks: {
                create: persistedBlocks.map((block) => ({
                  blockKey: block.blockKey,
                  type: block.type,
                  position: block.position,
                  title: block.title,
                  body: block.body,
                  url: block.url,
                  note: block.note,
                  submissionHint: block.submissionHint,
                })),
              },
              ...(homeworkBlock
                ? {
                    homeworkAssignment: {
                      create: {
                        instructions: homeworkBlock.body,
                        requiresCuratorReview:
                          lesson.homeworkSettings?.requiresCuratorReview ?? false,
                        unlockNextModuleOnApproval:
                          lesson.homeworkSettings?.unlockNextModuleOnApproval ?? false,
                        allowTextSubmission:
                          lesson.homeworkSettings?.allowTextSubmission ?? true,
                        allowLinkSubmission:
                          lesson.homeworkSettings?.allowLinkSubmission ?? false,
                        allowFileUpload:
                          lesson.homeworkSettings?.allowFileUpload ?? false,
                      },
                    },
                  }
                : {}),
            };
          }),
        },
      },
    });

    const product = await prisma.product.upsert({
      where: {
        courseId: course.id,
      },
      create: {
        courseId: course.id,
        name: courseDefinition.offer.name,
        description: courseDefinition.offer.description,
        isActive: courseDefinition.offer.isActive,
      },
      update: {
        name: courseDefinition.offer.name,
        description: courseDefinition.offer.description,
        isActive: courseDefinition.offer.isActive,
      },
      select: {
        id: true,
      },
    });

    await upsertDefaultPrice(
      product.id,
      courseDefinition.offer.amount,
      courseDefinition.offer.currency,
    );

    console.log(
      `[seed] Showcase course ensured for ${courseDefinition.slug} under ${author.email}`,
    );
  }
}
