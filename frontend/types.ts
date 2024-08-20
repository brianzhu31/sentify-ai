export type SearchItem = {
  search_id: number;
  ticker: string;
  href: string;
  label: string;
  created_at: string;
  active: boolean;
};

export type SearchHistoryData = {
  label: string;
  searches: SearchItem[];
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

export type CompanySelection = {
  company_name: string,
  ticker: string,
  alias: string
}