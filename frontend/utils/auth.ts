"use server";

import { createClient, createServiceClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import axios from "axios";
import jwt from 'jsonwebtoken';

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export async function signUp(formData: FormData) {
  const supabase = createClient();

  const signUpData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data, error } = await supabase.auth.signUp(signUpData);

  if (error) {
    redirect("/error");
  }

  let accessToken: string = "";
  if (data && data.session) {
    accessToken = data.session.access_token;
  }

  try {
    const response = await axios.post(
      `${apiUrl}/api/auth/register`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    const decodedToken = jwt.decode(accessToken)
    if (decodedToken){
      const userId = decodedToken["sub"] as string;
      deleteUser(userId);
    }
    revalidatePath("/error", "layout");
    redirect("/error")
  }

  revalidatePath("/search", "layout");
  redirect("/search");
}

export async function login(formData: FormData) {
  const supabase = createClient();

  const loginData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(loginData);

  if (error) {
    return error.message;
  }

  revalidatePath("/search", "layout");
  redirect("/search");
}

export async function logout() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

async function deleteUser(userId: string) {
  const supabase = createServiceClient();

  await supabase.auth.admin.deleteUser(
    userId,
  );
}
