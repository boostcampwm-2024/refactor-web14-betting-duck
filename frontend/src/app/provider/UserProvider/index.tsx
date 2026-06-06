import React from "react";
import type { AuthenticateUserInfo, UserInfo } from "@betting-duck/shared";
import { useSessionStoredUser } from "./hooks/useStoredUser";
import { useQuery } from "@tanstack/react-query";
import { authQueries } from "@/shared/lib/auth/authQuery";

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

  const { data: authData, isLoading } = useQuery({
    queryKey: authQueries.queryKey,
    queryFn: authQueries.queryFn,
  });

  React.useEffect(() => {
    if (!isLoading && authData) {
      if (authData.isAuthenticated) {
        if (
          !userInfo.isAuthenticated ||
          userInfo.nickname !== authData.userInfo.nickname ||
          userInfo.role !== authData.userInfo.role ||
          userInfo.duck !== authData.userInfo.duck ||
          userInfo.realDuck !== authData.userInfo.realDuck
        ) {
          updateUserInfo({
            isAuthenticated: true,
            nickname: authData.userInfo.nickname,
            role: authData.userInfo.role,
            duck: authData.userInfo.duck,
            realDuck: authData.userInfo.realDuck,
          });
        }
      } else {
        if (userInfo.isAuthenticated) {
          updateUserInfo({
            isAuthenticated: false,
            nickname: "",
            role: "guest",
            duck: 0,
            realDuck: 0,
          });
        }
      }
    }
  }, [authData, isLoading, userInfo, updateUserInfo]);

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
