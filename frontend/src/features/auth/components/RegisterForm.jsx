import { Link } from "react-router-dom";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

export function RegisterForm({ formData, handleChange, loading, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="First Name" htmlFor="register-name">
        <Input
          id="register-name"
          name="name"
          autoComplete="given-name"
          placeholder="John"
          value={formData.name}
          onChange={handleChange}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Last name" htmlFor="register-surname1">
          <Input
            id="register-surname1"
            name="surname1"
            autoComplete="family-name"
            placeholder="Doe"
            value={formData.surname1}
            onChange={handleChange}
          />
        </Field>
        <Field label="Second last name" htmlFor="register-surname2" hint="Optional">
          <Input
            id="register-surname2"
            name="surname2"
            placeholder="Optional"
            value={formData.surname2}
            onChange={handleChange}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Username" htmlFor="register-username">
          <Input
            id="register-username"
            name="username"
            autoComplete="username"
            placeholder="johndoe"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </Field>
        <Field label="Email" htmlFor="register-email">
          <Input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" htmlFor="register-password">
          <Input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Field>
        <Field label="Confirm Password" htmlFor="register-confirm-password">
          <Input
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </Field>
      </div>

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
        {loading ? (
          <>
            <Spinner size={16} label="Creating account" />
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
