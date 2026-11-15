import Seo from "@/shared/seo/Seo";
import AuthLayout from "@/features/auth/components/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useLogin } from "@/features/auth/hooks/useLogin";

export default function LoginPage({ onLogin }) {
  const login = useLogin(onLogin);

  return (
    <>
      <Seo
        title="Sign in"
        path="/login"
        description="Sign in to Task Manager to access your tasks, lists, calendar and time tracking."
      />
      <AuthLayout title="Sign in" description="Continue to your workspace." preview>
        <LoginForm
          username={login.username}
          setUsername={login.setUsername}
          password={login.password}
          setPassword={login.setPassword}
          loading={login.loading}
          error={login.error}
          onSubmit={login.submit}
        />
      </AuthLayout>
    </>
  );
}
