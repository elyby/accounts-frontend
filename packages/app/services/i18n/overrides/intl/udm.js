IntlPolyfill.__addLocaleData({
  locale: "udm",
  date: {
    ca: ["gregory", "generic"],
    hourNo0: true,
    hour12: false,
    formats: {
      short: "{1}, {0}",
      medium: "{1}, {0}",
      full: "{1}, {0}",
      long: "{1}, {0}",
      availableFormats: {
        d: "d",
        E: "ccc",
        Ed: "ccc, d",
        Ehm: "E h:mm a",
        EHm: "E HH:mm",
        Ehms: "E h:mm:ss a",
        EHms: "E HH:mm:ss",
        Gy: "G y 'аре'",
        GyMMM: "LLL G y",
        GyMMMd: "d MMM G y 'аре'",
        GyMMMEd: "E, d MMM G y 'аре'",
        h: "h a",
        H: "H",
        hm: "h:mm a",
        Hm: "H:mm",
        hms: "h:mm:ss a",
        Hms: "H:mm:ss",
        hmsv: "h:mm:ss a v",
        Hmsv: "H:mm:ss v",
        hmv: "h:mm a v",
        Hmv: "H:mm v",
        M: "L",
        Md: "dd.MM",
        MEd: "E, dd.MM",
        MMdd: "dd.MM",
        MMM: "LLL",
        MMMd: "d MMM",
        MMMEd: "ccc, d MMM",
        MMMMd: "d MMMM",
        ms: "mm:ss",
        y: "y",
        yM: "MM.y",
        yMd: "dd.MM.y",
        yMEd: "ccc, d.MM.y 'аре'",
        yMM: "MM.y",
        yMMM: "LLL y 'аре'",
        yMMMd: "d MMM y 'аре'",
        yMMMEd: "E, d MMM y 'аре'",
        yMMMM: "LLLL y 'аре'",
        yQQQ: "QQQ y 'аре'",
        yQQQQ: "QQQQ y 'аре'",
      },
      dateFormats: {
        yMMMMEEEEd: "EEEE, d MMMM y 'аре'",
        yMMMMd: "d MMMM y 'аре'",
        yMMMd: "d MMM y 'аре'",
        yMd: "dd.MM.yy",
      },
      timeFormats: {
        hmmsszzzz: "H:mm:ss zzzz",
        hmsz: "H:mm:ss z",
        hms: "H:mm:ss",
        hm: "H:mm",
      },
    },
    calendars: {
      generic: {
        months: {
          narrow: [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
          ],
          short: [
            "Т01",
            "Т02",
            "Т03",
            "Т04",
            "Т05",
            "Т06",
            "Т07",
            "Т08",
            "Т09",
            "Т10",
            "Т11",
            "Т12",
          ],
          long: [
            "Т01",
            "Т02",
            "Т03",
            "Т04",
            "Т05",
            "Т06",
            "Т07",
            "Т08",
            "Т09",
            "Т10",
            "Т11",
            "Т12",
          ],
        },
        days: {
          narrow: ["А", "В", "П", "В", "П", "У", "К"],
          short: ["ан", "вр", "пк", "вн", "па", "уд", "кн"],
          long: [
            "арнянунал",
            "вордӥськон",
            "пуксён",
            "вирнунал",
            "покчиарня",
            "удмуртарня",
            "кӧснунал",
          ],
        },
        eras: {
          narrow: ["ERA0", "ERA1"],
          short: ["ERA0", "ERA1"],
          long: ["ERA0", "ERA1"],
        },
        dayPeriods: { am: "ЛА", pm: "ЛБ" },
      },
      gregory: {
        months: {
          narrow: ["Т", "Т", "М", "А", "М", "И", "И", "А", "С", "О", "Н", "Д"],
          short: [
            "тшт",
            "тпт",
            "южт",
            "ошт",
            "крт",
            "ивт",
            "пст",
            "гкт",
            "кут",
            "квт",
            "шкт",
            "тст",
          ],
          long: [
            "толшоре",
            "тулыспалэ",
            "южтолэзе",
            "оштолэзе",
            "куартолэзе",
            "инвожое",
            "пӧсьтолэзе",
            "гудырикошконэ",
            "куарусёнэ",
            "коньывуонэ",
            "шуркынмонэ",
            "толсуре",
          ],
        },
        days: {
          narrow: ["А", "В", "П", "В", "П", "У", "К"],
          short: ["ан", "вр", "пк", "вн", "па", "уд", "кн"],
          long: [
            "арнянунал",
            "вордӥськон",
            "пуксён",
            "вирнунал",
            "покчиарня",
            "удмуртарня",
            "кӧснунал",
          ],
        },
        eras: {
          narrow: ["КА", "КБ", "ава", "ав"],
          short: ["КА", "КБ", "а.в.а", "а.в."],
          long: [
            "Кристослэн вордскем азяз",
            "Кристослэн вордскем бераз",
            "асьме вакытлэсь азьло",
            "асьме вакытэ",
          ],
        },
        dayPeriods: { am: "ЛА", pm: "ЛБ" },
      },
    },
  },
  number: {
    nu: ["latn"],
    patterns: {
      decimal: {
        positivePattern: "{number}",
        negativePattern: "{minusSign}{number}",
      },
      currency: {
        positivePattern: "{number} {currency}",
        negativePattern: "{minusSign}{number} {currency}",
      },
      percent: {
        positivePattern: "{number} {percentSign}",
        negativePattern: "{minusSign}{number} {percentSign}",
      },
    },
    symbols: {
      latn: {
        decimal: ",",
        group: " ",
        nan: "лыд ӧвӧл",
        plusSign: "+",
        minusSign: "-",
        percentSign: "%",
        infinity: "∞",
      },
    },
    currencies: {
      AUD: "A$",
      BRL: "R$",
      CAD: "CA$",
      CNY: "CN¥",
      EUR: "€",
      GBP: "£",
      HKD: "HK$",
      ILS: "₪",
      INR: "₹",
      JPY: "¥",
      KRW: "₩",
      MXN: "MX$",
      NZD: "NZ$",
      RUB: "₽",
      RUR: "р.",
      THB: "฿",
      TMT: "ТМТ",
      TWD: "NT$",
      UAH: "₴",
      USD: "$",
      VND: "₫",
      XAF: "FCFA",
      XCD: "EC$",
      XOF: "CFA",
      XPF: "CFPF",
      XXX: "XXXX",
    },
  },
});

