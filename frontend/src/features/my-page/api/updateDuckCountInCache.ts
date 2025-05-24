import { authQueries } from "@/shared/lib/auth/authQuery";
import { useQueryClient } from "@tanstack/react-query";
import type { AuthenticateUserInfo } from "@betting-duck/shared";

async function updateDuckCountInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  {
    currentDuck,
    numberOfDucks,
  }: { currentDuck: number; numberOfDucks: number },
) {
  await queryClient.setQueryData(
    authQueries.queryKey,
    (old: AuthenticateUserInfo) => ({
      ...old,
      userInfo: {
        ...old.userInfo,
        duck: currentDuck - 30,
        realDuck: numberOfDucks + 1,
      },
    }),
  );
}

export { updateDuckCountInCache };
