import { useEffect } from "react";
import { Fragment } from "react/jsx-runtime";
import { useSetRecoilState } from "recoil";
import { Auth } from "@/app/provider/RouterProvider/lib/auth";
import { checkAuthStatus } from "@/shared/lib/auth/guard";

function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuthState = useSetRecoilState(Auth);

  useEffect(() => {
    const initializeAuth = async () => {
      const { isAuthenticated, userInfo } = await checkAuthStatus();

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated,
        nickname: userInfo.nickname,
      }));
    };

    initializeAuth();
  }, [setAuthState]);

  return <Fragment>{children}</Fragment>;
}

export { AuthProvider };
