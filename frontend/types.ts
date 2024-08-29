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

export type UserAuthData = {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
}

export type SessionAuthData = {
  access_token: string;
  refresh_token: string;
}

export type CompanyPartial = {
  company_name: string;
  ticker: string;
  aliases: string[];
}

export type CompanyFull = {
  company_name: string;
  ticker: string;
  aliases: string[];
  exchange: string;
  currency: string;
}

export type SearchData = {
  company_name: string;
  created_at: string;
  created_by: string;
  id: number;
  negative_summaries: {
    source: {
      link: string;
      title: string;
    };
    summary: string;
  }[];
  positive_summaries: {
    source: {
      link: string;
      title: string;
    };
    summary: string;
  }[];
  score: number;
  ticker: string;
  top_sources: {
    article_link: string;
    article_title: string;
  }[];
};