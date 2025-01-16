import { useEffect, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { useSetRecoilState } from "recoil";
import { Auth } from "@/app/provider/RouterProvider/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { authQueries } from "@/shared/lib/auth/authQuery";
import { LoadingAnimation } from "@/shared/components/Loading";

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const setAuthState = useSetRecoilState(Auth);
  const { data } = useQuery({
    queryKey: authQueries.queryKey,
    queryFn: authQueries.queryFn,
  });

  useEffect(() => {
    if (data) {
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: data.isAuthenticated,
        nickname: data.userInfo.nickname,
      }));
    }

    setIsLoading(false);
  }, [data, setAuthState, setIsLoading]);

  return <Fragment>{isLoading ? <LoadingAnimation /> : children}</Fragment>;
}

export { AuthProvider };
