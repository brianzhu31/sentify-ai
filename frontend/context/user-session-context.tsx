"use client";

import { UserAuthData, SessionAuthData } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { fetchUser, fetchSession } from "./actions/fetch-user-session";

interface UserSessionContextProps {
  user: UserAuthData | undefined;
  session: SessionAuthData | undefined;
  setUser: (user: UserAuthData | undefined) => void;
  setSession: (session: SessionAuthData | undefined) => void;
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

  useEffect(() => {
    const fetchUserAndSession = async () => {
      const fetchUserResponse = await fetchUser();
      if (fetchUserResponse && fetchUserResponse.data) {
        setUser(fetchUserResponse.data);
      }
      const fetchSessionResponse = await fetchSession();
      if (fetchSessionResponse && fetchSessionResponse.data) {
        setSession(fetchSessionResponse.data)
      }
    };

    fetchUserAndSession();
  }, []);

  return (
    <UserSessionContext.Provider value={{ user, session, setUser, setSession }}>
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
