import { Link } from "react-router-dom";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

export function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  loading,
  error,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field label="Username" htmlFor="login-username">
        <Input
          id="login-username"
          name="username"
          autoComplete="username"
          placeholder="Your username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "login-error" : undefined}
          required
        />
      </Field>

      <Field
        label="Password"
        htmlFor="login-password"
        error={error}
        errorId="login-error"
      >
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "login-error" : undefined}
          required
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Spinner size={16} label="Signing in" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-brand hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
