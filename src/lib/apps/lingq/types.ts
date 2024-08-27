export type TGetLingqs = {
  language: languageCode;
  token: string;
  page: number;
  page_size: number;
};

export type TGetLingqContext = {
  language?: languageCode;
  page_size?: number;
  page?: number;
  token: string;
};

export type TGetLingqTTS = {
  language: languageCode;
  text: string;
  token: string;
};

export type TLingqReview = {
  language: languageCode;
  id: number;
  status: LingqStatus;
  extended_status: LingqExtendedStatus;
  token: string;
};