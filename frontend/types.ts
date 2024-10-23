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

export type CompanyAnalytics = {
  id: number;
  company_name: string;
  overall_summary: string;
  negative_summaries: {
    info: string;
    source: Article;
  }[];
  positive_summaries: {
    info: string;
    source: Article;
  }[];
  score: number;
  last_updated: string;
};

