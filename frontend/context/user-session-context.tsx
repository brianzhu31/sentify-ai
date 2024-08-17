"use client";

import { UserAuthData, SessionAuthData } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface UserSessionContextProps {
  user: UserAuthData | undefined;
  session: SessionAuthData | undefined;
}

const UserSessionContext = createContext<UserSessionContextProps | undefined>(
  undefined
);

export const UserSessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<UserAuthData | undefined>(undefined);
  const [session, setSession] = useState<SessionAuthData | undefined>(
    undefined
  );
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;

        const user = data.user;

        if (user) {
          const userData: UserAuthData = {
            email: user.user_metadata.email ?? "",
            email_verified: user.user_metadata.email_verified ?? false,
            phone_verified: user.user_metadata.phone_verified ?? false,
            sub: user.id ?? "",
          };
          setUser(userData);
        } else {
          setUser(undefined); // Or provide default values as necessary
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(undefined);
      }
    };

    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const session = data.session;

        if (session) {
          const sessionData: SessionAuthData = {
            access_token: session?.access_token ?? "",
            refresh_token: session?.refresh_token ?? "",
          };
          setSession(sessionData);
        } else {
          setSession(undefined);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setSession(undefined);
      }
    };

    fetchUser();
    fetchSession();
  }, [supabase.auth]);

  return (
    <UserSessionContext.Provider value={{ user, session }}>
      {children}
    </UserSessionContext.Provider>
  );
};

export const useUserSession = () => {
  const context = useContext(UserSessionContext);
  if (context === undefined) {
    throw new Error("useUserSession must be used within a UserSessionProvider");
  }
  return context;
};
