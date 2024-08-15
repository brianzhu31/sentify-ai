"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface UserSessionContextProps {
  user: any;
  session: any;
}

const UserSessionContext = createContext<UserSessionContextProps | undefined>(undefined);

export const UserSessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log(data)
      setSession(data);
    };

    fetchUser();
    fetchSession();
  }, []);

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
