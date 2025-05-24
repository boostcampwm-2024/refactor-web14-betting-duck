import { QueryClient } from "@tanstack/react-query";
import { authQueries } from "../lib/auth/authQuery";
import { AuthenticateUserInfo } from "@betting-duck/shared";

type QueryData = AuthenticateUserInfo;

async function updateQueryClient(
  queryClient: QueryClient,
  queryKey: string[],
  callback: (prev: QueryData) => QueryData,
) {
  queryClient.setQueryData(authQueries.queryKey, callback);
  await queryClient.invalidateQueries({ queryKey });
}

export { updateQueryClient };
