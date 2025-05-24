import {
  authenticatedUserInfoSchema,
  userInfoSchema,
} from "@betting-duck/shared";

import type { AuthenticateUserInfo, UserInfo } from "@betting-duck/shared";

const defaultUserInfo: UserInfo = {
  message: "OK",
  role: "user",
  nickname: "",
  duck: 0,
  realDuck: 0,
};

export async function getAuthenciateUserInfo(): Promise<AuthenticateUserInfo> {
  const tokenResponse = await fetch("/api/users/token", {
    headers: {
      "Cache-Control": "stale-while-revalidate",
      Pragma: "no-cache",
    },
    credentials: "include",
  });

  if (!tokenResponse.ok) {
    return {
      isAuthenticated: false,
      userInfo: defaultUserInfo,
    };
  }

  const userInfoResponse = await fetch("/api/users/userInfo", {
    headers: {
      "Cache-Control": "stale-while-revalidate",
      Pragma: "no-cache",
    },
    credentials: "include",
  });

  if (!userInfoResponse.ok) {
    return {
      isAuthenticated: false,
      userInfo: defaultUserInfo,
    };
  }

  const { data } = await userInfoResponse.json();
  const result = userInfoSchema.safeParse(data);
  if (!result.success) {
    return {
      isAuthenticated: false,
      userInfo: defaultUserInfo,
    };
  }

  return {
    isAuthenticated: true,
    userInfo: result.data,
  };
}

export async function getUserInfo() {
  const userInfoResponse = await fetch("/api/users/userInfo", {
    headers: {
      "Cache-Control": "stale-while-revalidate",
      Pragma: "no-cache",
    },
    credentials: "include",
  });

  if (!userInfoResponse.ok) {
    return defaultUserInfo;
  }

  const { data } = await userInfoResponse.json();
  const result = authenticatedUserInfoSchema.safeParse(data);

  if (!result.success) {
    return defaultUserInfo;
  }

  return result.data;
}
