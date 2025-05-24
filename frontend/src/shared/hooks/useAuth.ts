import { useQueryClient } from "@tanstack/react-query";
import { AuthenticateUserInfo } from "@betting-duck/shared";
import { authQueries } from "../lib/auth/authQuery";

type UserInfoType = AuthenticateUserInfo;

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  const updateAuthStatus = (
    isAuthenticated: boolean,
    userInfo: UserInfoType["userInfo"],
  ) => {
    queryClient.setQueryData(authQueries.queryKey, {
      data: {
        isAuthenticated,
        userInfo,
      },
    });
  };
  return { updateAuthStatus };
}
