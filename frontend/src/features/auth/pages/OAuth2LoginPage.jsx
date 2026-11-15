import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "@/services/authService";
import configService from "@/services/configService";
import { errorToast } from "@/shared/feedback/Noty";
import Seo from "@/shared/seo/Seo";
import AuthLayout from "@/features/auth/components/AuthLayout";
import { ProviderButton } from "@/features/auth/components/ProviderButton";
import { Alert } from "@/shared/ui/alert";

const PROVIDERS = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
  { id: "authentik", label: "Authentik" },
];

export default function OAuth2LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState("");

  const enabledProviders = PROVIDERS.filter((provider) =>
    configService.isOAuth2ProviderEnabled(provider.id),
  );

  const handleOAuth2Login = async (provider) => {
    setLoadingProvider(provider);
    try {
      await authService.loginWithOAuth2(provider);
    } catch (error) {
      setLoadingProvider("");
      errorToast(`Error OAuth2: ${error.message}`);
    }
  };

  return (
    <>
      <Seo
        title="Sign in with SSO"
        path="/oauth2-login"
        description="Sign in to Task Manager with your identity provider (Google, GitHub or Authentik)."
        noindex
      />
      <AuthLayout
        title="Sign in with SSO"
        description="Use your identity provider to continue."
        preview
      >
        <p className="mb-4 text-2xs font-medium text-muted-foreground">
          Quick access
        </p>

        {enabledProviders.length > 0 ? (
          <div className="grid gap-3">
            {enabledProviders.map((provider) => (
              <ProviderButton
                key={provider.id}
                provider={provider.id}
                label={provider.label}
                loading={loadingProvider === provider.id}
                disabled={Boolean(loadingProvider)}
                onClick={() => handleOAuth2Login(provider.id)}
              />
            ))}
          </div>
        ) : (
          <Alert tone="info">
            No identity providers are enabled. An administrator can configure
            Google, GitHub or Authentik in the server settings.
          </Alert>
        )}

        <div className="mt-6 space-y-2 border-t border-border pt-5 text-center text-sm text-muted-foreground">
          <p>
            Prefer email &amp; password?{" "}
            <Link to="/login" className="font-medium text-brand hover:underline">
              Sign in
            </Link>
          </p>
          <p>
            New here?{" "}
            <Link to="/register" className="font-medium text-brand hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </AuthLayout>
    </>
  );
}
