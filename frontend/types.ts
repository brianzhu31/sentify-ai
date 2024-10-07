export type SearchItem = {
  search_id: string;
  ticker: string;
  href: string;
  company_name: string;
  created_at: string;
};

export type SearchHistoryData = {
  label: string;
  searches: SearchItem[];
  has_more: boolean;
};

export type ChatItem = {
  chat_id: string;
  name: string;
  href: string;
  last_accessed: Date;
}

export type ChatHistoryData = {
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
};

export type Article = {
  clean_url: string;
  compressed_summary: string;
  media: string;
  published_date: Date;
  title: string;
  url: string;
};

export type AnalysisData = {
  negative_summaries: {
    value: string;
    source: Article;
  }[];
  positive_summaries: {
    value: string;
    source: Article;
  }[];
  overall_summary: string;
  score: number;
  sources: Article[];
};

export type SearchData = {
  company_name: string;
  created_by: string;
  id: number;
  ticker: string;
  exchange: string;
  currency: string;
  created_at: Date;
  data_from: Date;
  days_range: number;
  analysis_data: AnalysisData;
};
