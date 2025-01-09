import { Suspense } from "react";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { UserProvider } from "@/app/provider/UserProvider";
import { GlobalErrorComponent } from "@/shared/components/Error/GlobalError";
import { LayoutProvider } from "@/app/provider/LayoutProvider";
import { RouterContext } from "@/main";
import { authQueries } from "@/shared/lib/auth/authQuery";
import { LoadingAnimation } from "@/shared/components/Loading";
import { Layout } from "@/app/layout";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <LayoutProvider>
      <UserProvider>
        <Layout>
          <Suspense fallback={<LoadingAnimation />}>
            <Outlet />
          </Suspense>
        </Layout>
      </UserProvider>
    </LayoutProvider>
  ),
  loader: (opts) => opts.context.queryClient.ensureQueryData(authQueries),
  errorComponent: ({ error }) => <GlobalErrorComponent error={error} to="/" />,
});
