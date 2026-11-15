import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/app/layout/sidebar/AppSidebar";
import { SessionManager } from "@/features/session";
import { SystemMessageDialog } from "@/features/system-messages";
import Seo from "@/shared/seo/Seo";
import { Spinner } from "@/shared/ui/spinner";
import { getMetaForPath } from "@/app/routes";

export default function AppLayout({ onLogOut }) {
  const location = useLocation();
  const meta = getMetaForPath(location.pathname);

  return (
    <div className="flex min-h-dvh flex-col bg-background md:flex-row">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:border focus:border-border focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <AppSidebar onLogOut={onLogOut} />
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1">
        <Seo title={meta.title} path={location.pathname} description={meta.description} noindex />
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center">
              <Spinner size={22} label="Loading page" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <SessionManager onLogOut={onLogOut} />
      <SystemMessageDialog context="afterLogin" />
    </div>
  );
}
