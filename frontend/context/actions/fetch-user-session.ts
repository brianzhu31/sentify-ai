"use server";

import { createClient } from "@/utils/supabase/server";
import { UserAuthData, SessionAuthData } from "@/types";

export const fetchUser = async (): Promise<UserAuthData | undefined> => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return undefined;
    }

    const user = data.user;

    const userData: UserAuthData = {
      email: user.user_metadata.email ?? "",
      email_verified: user.user_metadata.email_verified ?? false,
      phone_verified: user.user_metadata.phone_verified ?? false,
      sub: user.id ?? "",
    };
    return userData;
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const fetchSession = async (): Promise<SessionAuthData | undefined> => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      return undefined;
    }

    const session = data.session;

    const sessionData: SessionAuthData = {
      access_token: session?.access_token ?? "",
      refresh_token: session?.refresh_token ?? "",
    };
    return sessionData;
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
