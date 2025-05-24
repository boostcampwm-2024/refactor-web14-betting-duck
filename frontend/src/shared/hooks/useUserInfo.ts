import {
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { responseUserInfo } from "../api/responseUserInfo";
import { UserInfo } from "@betting-duck/shared";
import { DEFAULT_USERINFO } from "../constants";

const USER_INFO_QUERY_KEY = ["userInfo"] as const;

type USER_INFO_QUERY_KEY = typeof USER_INFO_QUERY_KEY;

const userInfoQueries: UseSuspenseQueryOptions<
  UserInfo,
  Error,
  UserInfo,
  USER_INFO_QUERY_KEY
> = {
  queryKey: USER_INFO_QUERY_KEY,
  queryFn: async (): Promise<UserInfo> => {
    const userInfo = await responseUserInfo();
    return userInfo;
  },
  initialData: DEFAULT_USERINFO,
  retry: 2,
};

function useUserInfo(): UseSuspenseQueryResult<UserInfo, Error> {
  return useSuspenseQuery<UserInfo, Error, UserInfo, USER_INFO_QUERY_KEY>(
    userInfoQueries,
  );
}

export { userInfoQueries, useUserInfo, USER_INFO_QUERY_KEY };
