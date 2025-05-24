import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authQueries } from "@/shared/lib/auth/authQuery";
import type { AuthenticateUserInfo } from "@betting-duck/shared";

function useDuckState(authData: AuthenticateUserInfo) {
  const queryClient = useQueryClient();

  const currentDuck = authData.userInfo.duck;
  const numberOfDucks = authData.userInfo.realDuck;

  const addDuck = useCallback(() => {
    queryClient.setQueryData(
      authQueries.queryKey,
      (old: AuthenticateUserInfo) => ({
        ...old,
        userInfo: {
          ...old.userInfo,
          duck: old.userInfo.duck - 30,
          realDuck: old.userInfo.realDuck + 1,
        },
      }),
    );
  }, [queryClient]);

  return {
    currentDuck,
    numberOfDucks,
    addDuck,
  };
}

export { useDuckState };
