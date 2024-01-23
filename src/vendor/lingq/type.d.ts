type languageCode =
    | "cs"
    | "no"
    | "tr"
    | "fi"
    | "he"
    | "ro"
    | "nl"
    | "el"
    | "pl"
    | "eo"
    | "la"
    | "da"
    | "uk"
    | "sk"
    | "ms"
    | "id"
    | "zh-t"
    | "hk"
    | "gu"
    | "bg"
    | "fa"
    | "be"
    | "ar"
    | "srp"
    | "hrv"
    | "hu"
    | "ca"
    | "en"
    | "fr"
    | "de"
    | "es"
    | "it"
    | "ja"
    | "ko"
    | "zh"
    | "pt"
    | "ru"
    | "sv";

type Contexts = {
    count: number,
    next: string | null,
    previous: string | null,
    results: Context[]
}

type Context = {
    pk: number,
    url: string,
    language: LangeuageContext,
    repetition_lingqs: number,
    lotd_dates: string[],
    email_notifications: { [key: string]: string },
    site_notifications: { [key: string]: string },
    feed_levels: any,
    use_feed: any,
    intense: string,
    streak_days: number,
    apple_level: number
}

type LangeuageContext = {
    id: number,
    url: string,
    code: languageCode,
    title: string,
    supported: boolean,
    knownWords: number,
    lastUsed: string,
    grammarResourceSlug: string,
    scheduledForDeletion: boolean,
}


type Lingqs = {
    count: number,
    next: string | null,
    previous: string | null,
    results: Lingq[]
}

enum LingqStatus {
    New = 0,
    Recognized = 1,
    Familiar = 2,
    Learned = 3,
}

enum LingqExtendedStatus {
    Learning = 0,
    Known = 3,
}
type LingqHint = {
    id: string,
    locale: string,
    text: string,
    term: string,
    popularity: number,
    is_google_translate: boolean,
    flagged: boolean,
}

type LingqTransliteration = {
    [key: string]: string[] | { [key: string]: string }[]
}

type Lingq = {
    pk: number,
    url: string,
    term: string,
    fragment: string,
    importance: number,
    status: LingqStatus,
    extended_status: LingqExtendedStatus,
    last_reviewed_correct: string | null,
    srs_due_date: string,
    notes: string | null,
    audio: string | null,
    words: string[],
    tags: string[],
    hints: LingqHint[]
    transliteration: LingqTransliteration,
    gTags: string[],
    wordTags: string[],
    readings: { [key: string]: string[] },
    writings: string[]
}

type LingqChangeStatus = {
    status: LingqStatus,
    extended_status: LingqExtendedStatus,
}