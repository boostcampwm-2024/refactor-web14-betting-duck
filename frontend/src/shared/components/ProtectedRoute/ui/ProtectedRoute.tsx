import { useRecoilValue } from "recoil";
import { Auth } from "@/app/provider/RouterProvider/lib/auth";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { ROUTES } from "@/shared/config/route";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const authState = useRecoilValue(Auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authState.isAuthenticated && location.pathname == ROUTES.LOGIN) {
      navigate({
        to: "/my-page",
        search: { from: encodeURIComponent(ROUTES.LOGIN) },
      });
    }

    if (!authState.isAuthenticated && location.pathname == ROUTES.MYPAGE) {
      navigate({
        to: "/require-login",
        search: { from: encodeURIComponent(ROUTES.MYPAGE) },
      });
    }
  }, [authState.isAuthenticated, navigate, location.pathname]);

  return <>{children}</>;
}
