export type ChatItem = {
  chat_id: string;
  name: string;
  href: string;
  last_accessed: Date;
}

export type PaginatedChatHistoryData = {
  label: string;
  chats: ChatItem[];
  has_more: boolean;
}

export type UserAuthData = {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
};

export type SessionAuthData = {
  access_token: string;
  refresh_token: string;
};

export type CompanyPartial = {
  company_name: string;
  ticker: string;
  aliases: string[];
};

export type CompanyFull = {
  company_name: string;
  ticker: string;
  aliases: string[];
  exchange: string;
  currency: string;
  score?: number;
};

export type Article = {
  clean_url: string;
  published_date: Date | number;
  title: string;
  url: string;
  compressed_summary?: string;
  media?: string;
};

export type PaginatedArticlesData = {
  articles: Article[];
  has_more: boolean;
}

export type SummarySection = {
  header: string;
  paragraphs: string[];
  sources: Article[];
}

export type CompanyAnalytics = {
  id: number;
  company_name: string;
  summary_sections: SummarySection[];
  score: number;
  last_updated: string;
};

export type TimeSeriesOptionValue = {
  datetime: string;
  price: number;
}

export type TimeSeriesOption = {
  min_price: number;
  max_price: number;
  values: TimeSeriesOptionValue[]
}

export type TimeSeries = {
  [key: string]: TimeSeriesOption;
};

export type StockPriceData = {
  ticker: string;
  price: number;
}