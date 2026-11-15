import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "@/shared/lib/icons";
import configService from "@/services/configService";
import Seo from "@/shared/seo/Seo";
import AuthLayout from "@/features/auth/components/AuthLayout";
import { Button } from "@/shared/ui/button";

export default function LandingPage() {
  const navigate = useNavigate();
  const oauthEnabled = configService.isOAuth2Enabled();

  return (
    <>
      <Seo
        path="/"
        description="Task Manager is a self-hosted task management platform for teams and individuals. Sign in to organise your tasks, lists, calendar and time tracking."
      />
      <AuthLayout
        title={configService.getAppName()}
        description="Your tasks, under control. A precise workspace for everything you need to finish."
        preview
        showSystemMessage
      >
        <div className="grid gap-3">
          <Button size="lg" onClick={() => navigate("/login")}>
            Sign in
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate("/register")}>
            Create account
          </Button>
        </div>

        {oauthEnabled ? (
          <>
            <div className="my-6 flex items-center gap-3 text-2xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              <span>or</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/oauth2-login")}
            >
              <ShieldCheck size={17} aria-hidden="true" />
              Continue with SSO
            </Button>
          </>
        ) : null}
      </AuthLayout>
    </>
  );
}
