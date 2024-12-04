"use client";

import { createClient } from "./supabase/client";
import { fetchUser } from "@/context/actions/fetch-user-session";
import { UserAuthData } from "@/types";

export const login = async (formData: FormData, setUser: (user: UserAuthData | undefined) => void) => {
  const supabase = createClient();

  const loginData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(loginData);
  const user = await fetchUser();
  setUser(user);

  if (error) {
    throw new Error(error.message);
  }

  
  return { message: "Login success" };
};

export const logout = async (setUser: (user: UserAuthData | undefined) => void) => {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  setUser(undefined);
  return { message: "Logout success" };
};
