export type Lang = 'uz' | 'ru'

export const TRANSLATIONS = {
  uz: {
    nav: {
      problem: "Muammo",
      solution: "Yechim",
      how: "Qanday ishlaydi",
      pricing: "Narxlar",
      login: "Kirish",
      start: "Boshlash",
    },
    hero: {
      badge: "O'zbekiston uchun logistika platformasi",
      h1a: "Barcha yetkazib berish xizmatlari —",
      h1b: "bitta tugma",
      p: "Bitta platformada barcha kuryer xizmatlariga buyurtma yarating. Ilovalar orasida o'tib o'tirmang, ma'lumotni qaytadan kiritmang.",
      btn1: "7 kun bepul boshlash",
      btn2: "Demo ko'rish",
      f1: "Karta talab qilinmaydi",
      f2: "5 daqiqada sozlash",
      f3: "Istalgan vaqtda bekor qilish",
    },
    problem: {
      label: "Muammo",
      h2a: "Har kuni buyurtma uchun",
      h2b: "15 minut",
      h2c: "vaqt yo'qotasizmi?",
      items: [
        {
          title: "Har bir kuryer ilovasiga alohida kirasiz",
          desc: "Noor, Millennium, Yandex Go — har biri uchun alohida tab, parol, forma. Vaqt yo'qoladi.",
        },
        {
          title: "Mijoz geolokatsiya yuboradi — manzil noto'g'ri",
          desc: "Kuryer adashadi, qo'ng'iroq qiladi, mijoz norozi bo'ladi. Yetkazish kechikadi.",
        },
        {
          title: "Eshikka, qavat, telefon — har safar qaytadan",
          desc: "Bir xil ma'lumotni qayta-qayta yozasiz. Xato qilish ehtimoli yuqori.",
        },
      ],
    },
    solution: {
      label: "Yechim",
      h2a: "Tezyubor bilan",
      h2b: "1 bosishda",
      h2c: "buyurtma",
      features: [
        {
          title: "Bitta platforma — barcha kuryer xizmatlar",
          desc: "Noor, Millennium va boshqalarga bitta dashboarddan ulaning. Bir marta yarating — buyurtma siz tanlagan kuryerga zudlik bilan ketadi.",
        },
        {
          title: "Mijoz o'zi aniq manzilni kiritadi",
          desc: "Mijozga aqlli havola yuboring. U xaritada aniq nuqta, qavat, eshik kodi va vaqt oralig'ini tanlaydi.",
        },
        {
          title: "Narx va ETA bir zumda",
          desc: "Tasdiqlashdan oldin har bir kuryerdan real vaqtdagi narx va yetib borish vaqtini ko'ring. Eng yaxshisini tanlang.",
        },
      ],
    },
    how: {
      label: "Jarayon",
      h2: "Qanday ishlaydi?",
      steps: [
        { title: "Buyurtma yarating", desc: "Mahsulot ma'lumotlarini dashboardingizga kiriting." },
        { title: "Linkni yuboring", desc: "Mijoz aqlli yetkazib berish havolasini oladi." },
        { title: "Mijoz manzil tanlaydi", desc: "Xaritada aniq nuqta + qo'shimcha sozlamalar." },
        { title: "Kuryer yo'lga chiqadi", desc: "Tanlangan kuryer xizmatida buyurtma yaratiladi." },
      ],
    },
    payment: {
      label: "To'lov",
      h2a: "Mijoz to'lovni",
      h2b: "o'zi tanlaydi",
      modes: [
        {
          title: "Yetkazganda naqd",
          desc: "Mijoz faqat yetkazib berish narxini kuryerga naqd to'laydi.",
          tag: "Eng mashhur" as string | null,
        },
        {
          title: "To'liq naqd",
          desc: "Mijoz mahsulot + yetkazib berish summasini kuryerga to'laydi.",
          tag: null as string | null,
        },
      ],
    },
    integrations: {
      h2: "Ulangan xizmatlar",
      p: "Yangi kuryer xizmatlar tez orada...",
      soon: "+ tez orada",
    },
    pricing: {
      label: "Narxlar",
      h2: "Oddiy narxlar",
      p: "Yashirin to'lovlarsiz. Bitta tarif — barcha imkoniyatlar.",
      badge: "BASE",
      price: "100 000",
      currency: "so'm",
      period: "oyiga, soliqlarsiz",
      features: [
        "Cheksiz buyurtmalar",
        "Barcha kuryer integratsiyalari",
        "Aqlli mijoz havolalari",
        "Real vaqtda narx va ETA",
        "Hisobotlar va analitika",
        "Email va Telegram qo'llab-quvvatlash",
      ],
      btn: "7 kun bepul boshlash",
      noCard: "Karta talab qilinmaydi",
    },
    testimonials: {
      label: "Mijozlar",
      h2: "Ishonchli kompaniyalar tanlovi",
      items: [
        {
          quote: "Avval xar xil yetkazib berish ilovalariga alohida kirib, vaqtimning yarmini yo'qotardim. Tezyubor bilan ikkala xizmatga bir zumda buyurtma beraman.",
          name: "Nodira X.",
          role: "Dorixona egasi",
          city: "Toshkent",
          initials: "NX",
        },
        {
          quote: "Mijozlarga link yuboraman — ular xaritada aniq joyni belgilashadi. Adashish, qo'ng'iroqlar tugadi. Kuniga 30+ buyurtma — muammosiz.",
          name: "Sardor T.",
          role: "Onlayn do'kon egasi",
          city: "Samarqand",
          initials: "ST",
        },
        {
          quote: "Eng arzon va eng tez kuryerni bir nigohda ko'rish — bu menga oyiga 2 mln so'mga arziydi. Tezyubor bizning ish jarayonimizni butunlay o'zgartirdi.",
          name: "Madina A.",
          role: "Restoran direktori",
          city: "Toshkent",
          initials: "MA",
        },
      ],
    },
    cta: {
      h2: "Bugun boshlang — 7 kun bepul",
      p: "Karta kerak emas. 5 daqiqada sozlang va birinchi buyurtmangizni bugun yarating.",
      btn1: "Ro'yxatdan o'tish",
      btn2: "Biz bilan bog'laning",
    },
    footer: {
      product: "Mahsulot",
      contact: "Aloqa",
      links: { pricing: "Narxlar", how: "Qanday ishlaydi", contactLink: "Bog'lanish" },
      tagline: "Yetkazib berishni osonlashtiring.",
      copyright: "Barcha huquqlar himoyalangan.",
      location: "Toshkent, O'zbekiston",
    },
  },

  ru: {
    nav: {
      problem: "Проблема",
      solution: "Решение",
      how: "Как работает",
      pricing: "Цены",
      login: "Войти",
      start: "Начать",
    },
    hero: {
      badge: "Логистическая платформа для Узбекистана",
      h1a: "Все службы доставки —",
      h1b: "одна кнопка",
      p: "Создавайте заказы ко всем курьерским службам на одной платформе. Не переключайтесь между приложениями, не вводите данные повторно.",
      btn1: "Начать бесплатно на 7 дней",
      btn2: "Смотреть демо",
      f1: "Карта не нужна",
      f2: "Настройка за 5 минут",
      f3: "Отмена в любое время",
    },
    problem: {
      label: "Проблема",
      h2a: "Тратите по",
      h2b: "15 минут",
      h2c: "на каждый заказ?",
      items: [
        {
          title: "Отдельный вход в каждое приложение",
          desc: "Noor, Millennium, Yandex Go — отдельная вкладка, пароль, форма для каждого. Время уходит впустую.",
        },
        {
          title: "Клиент присылает геолокацию — адрес неверный",
          desc: "Курьер теряется, звонит, клиент недоволен. Доставка задерживается.",
        },
        {
          title: "Подъезд, этаж, телефон — каждый раз заново",
          desc: "Одни и те же данные приходится вводить снова и снова. Ошибки неизбежны.",
        },
      ],
    },
    solution: {
      label: "Решение",
      h2a: "С Tezyubor —",
      h2b: "1 кликом",
      h2c: "заказ",
      features: [
        {
          title: "Одна платформа — все курьерские службы",
          desc: "Подключайтесь к Noor, Millennium и другим из одного дашборда. Создайте один раз — заказ мгновенно уходит к выбранному курьеру.",
        },
        {
          title: "Клиент сам вводит точный адрес",
          desc: "Отправьте клиенту умную ссылку. Он указывает точку на карте, этаж, код домофона и удобное время.",
        },
        {
          title: "Цена и ETA за секунды",
          desc: "До подтверждения видите реальные цены и время доставки от каждого курьера. Выбирайте лучшее.",
        },
      ],
    },
    how: {
      label: "Процесс",
      h2: "Как это работает?",
      steps: [
        { title: "Создайте заказ", desc: "Введите данные о товаре в дашборд." },
        { title: "Отправьте ссылку", desc: "Клиент получает умную ссылку на доставку." },
        { title: "Клиент выбирает адрес", desc: "Точка на карте + дополнительные настройки." },
        { title: "Курьер выезжает", desc: "Заказ создаётся в выбранной курьерской службе." },
      ],
    },
    payment: {
      label: "Оплата",
      h2a: "Клиент выбирает",
      h2b: "способ оплаты сам",
      modes: [
        {
          title: "Наличные при получении",
          desc: "Клиент платит курьеру только за доставку наличными.",
          tag: "Самый популярный" as string | null,
        },
        {
          title: "Полная оплата наличными",
          desc: "Клиент платит курьеру за товар + доставку наличными.",
          tag: null as string | null,
        },
      ],
    },
    integrations: {
      h2: "Подключённые сервисы",
      p: "Новые курьерские службы скоро...",
      soon: "+ скоро",
    },
    pricing: {
      label: "Цены",
      h2: "Простые цены",
      p: "Без скрытых платежей. Один тариф — все возможности.",
      badge: "BASE",
      price: "100 000",
      currency: "сум",
      period: "в месяц, без налогов",
      features: [
        "Безлимитные заказы",
        "Все курьерские интеграции",
        "Умные ссылки для клиентов",
        "Цена и ETA в реальном времени",
        "Отчёты и аналитика",
        "Поддержка по Email и Telegram",
      ],
      btn: "Начать бесплатно на 7 дней",
      noCard: "Карта не нужна",
    },
    testimonials: {
      label: "Клиенты",
      h2: "Выбор надёжных компаний",
      items: [
        {
          quote: "Раньше я тратила половину времени, заходя в разные приложения доставки. С Tezyubor оформляю заказ сразу в обе службы за секунды.",
          name: "Нодира Х.",
          role: "Владелец аптеки",
          city: "Ташкент",
          initials: "НХ",
        },
        {
          quote: "Отправляю клиентам ссылку — они сами отмечают точное место. Никаких ошибок, никаких звонков. 30+ заказов в день — без проблем.",
          name: "Сардор Т.",
          role: "Владелец интернет-магазина",
          city: "Самарканд",
          initials: "СТ",
        },
        {
          quote: "Видеть самого дешёвого и быстрого курьера одним взглядом — это экономит мне 2 млн сум в месяц. Tezyubor полностью изменил наш рабочий процесс.",
          name: "Мадина А.",
          role: "Директор ресторана",
          city: "Ташкент",
          initials: "МА",
        },
      ],
    },
    cta: {
      h2: "Начните сегодня — 7 дней бесплатно",
      p: "Карта не нужна. Настройте за 5 минут и создайте первый заказ уже сегодня.",
      btn1: "Зарегистрироваться",
      btn2: "Связаться с нами",
    },
    footer: {
      product: "Продукт",
      contact: "Контакт",
      links: { pricing: "Цены", how: "Как работает", contactLink: "Связаться" },
      tagline: "Упростите доставку.",
      copyright: "Все права защищены.",
      location: "Ташкент, Узбекистан",
    },
  },
} as const

export type Translations = typeof TRANSLATIONS['uz']
