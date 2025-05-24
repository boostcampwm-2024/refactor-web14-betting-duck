import React from "react";
import type { AuthenticateUserInfo, UserInfo } from "@betting-duck/shared";
import { useSessionStoredUser } from "./hooks/useStoredUser";

export type UserInfoWithRoomId = {
  roomId?: string | undefined;
  message?: UserInfo["message"];
  role?: UserInfo["role"];
  nickname?: UserInfo["nickname"];
  duck?: UserInfo["duck"];
  realDuck?: UserInfo["realDuck"];
  isAuthenticated?: AuthenticateUserInfo["isAuthenticated"];
};

interface UserContextType {
  userInfo: UserInfoWithRoomId;
  setUserInfo: (info: UserInfoWithRoomId) => Promise<void>;
}

const UserContext = React.createContext<UserContextType | null>(null);

function UserProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, updateUserInfo] = useSessionStoredUser();
  const value = React.useMemo(
    () => ({
      userInfo,
      setUserInfo: updateUserInfo,
    }),
    [userInfo, updateUserInfo],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export { UserProvider, UserContext };
