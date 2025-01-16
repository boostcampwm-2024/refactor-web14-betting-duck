import { z } from "zod";
import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useUserContext } from "@/shared/hooks/useUserContext";
import { useSetRecoilState } from "recoil";
import { useQueryClient } from "@tanstack/react-query";
import { Auth } from "@/app/provider/RouterProvider/lib/auth";
import { authQueries } from "@/shared/lib/auth/authQuery";
import { AuthStatusTypeSchema } from "@/shared/lib/auth/guard";

export const useLogout = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useUserContext();
  const setAuthState = useSetRecoilState(Auth);
  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    try {
      const response = await fetch("/api/users/signout", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("로그아웃에 실패했습니다.");
      }

      // Recoil 상태 업데이트
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        nickname: "",
      }));

      // User Context 상태 업데이트
      setUserInfo({ isAuthenticated: false, nickname: "", role: "guest" });

      // React Query 상태 업데이트
      queryClient.setQueryData(
        authQueries.queryKey,
        (prev: z.infer<typeof AuthStatusTypeSchema>) => ({
          ...prev,
          userInfo: {
            role: "guest",
            nickname: "",
            duck: 0,
            message: "OK",
            realDuck: prev.userInfo.realDuck,
          },
        }),
      );

      await queryClient.invalidateQueries({
        queryKey: authQueries.queryKey,
      });

      // 로그인 페이지로 네비게이션
      navigate({ to: "/login" });
    } catch (error) {
      console.error("Logout Error:", error);
      // 추가적인 에러 처리 로직 (예: 사용자에게 에러 메시지 표시)
      alert("로그아웃 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  }, [navigate, setUserInfo, setAuthState, queryClient]);

  return logout;
};
