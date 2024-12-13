"use server";

import { createClient, createServiceClient } from "@/utils/supabase/server";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const signUp = async (formData: FormData) => {
  const supabase = createClient();

  const signUpData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data, error } = await supabase.auth.signUp(signUpData);

  if (error) {
    return {
      success: false,
      error: error.message
    };
  }

  const userID = data?.user?.id;
  const email = data?.user?.email;

  try {
    const response = await axios.post(
      `${apiUrl}/api/auth/register`,
      {
        user_id: userID,
        email: email
      },
      {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );
    return {
      success: true,
      message: "Registration successful! Please check your email inbox for a verification link to activate your account."
    }
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      return {
        success: false,
        error: err.response.data.message
      };
    } else {
      return {
        success: false,
        error: "An unexpected error occurred"
      };
    }
  }
}

const deleteUser = async (userID: string) => {
  const supabase = createServiceClient();

  await supabase.auth.admin.deleteUser(userID);
}
