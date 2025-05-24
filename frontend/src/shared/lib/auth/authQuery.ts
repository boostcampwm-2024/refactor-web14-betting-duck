import { getAuthenciateUserInfo, getUserInfo } from "./guard";

const authQueries = {
  queryKey: ["auth"],
  queryFn: getAuthenciateUserInfo,
  gcTime: 1000 * 60 * 60 * 24,
  staleTime: 1000 * 60 * 60,
};

const userInfoQueries = {
  queryKey: ["auth", "userInfos"],
  queryFn: getUserInfo,
};

export { authQueries, userInfoQueries };
