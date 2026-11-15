import Seo from "@/shared/seo/Seo";
import AuthLayout from "@/features/auth/components/AuthLayout";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { useRegister } from "@/features/auth/hooks/useRegister";

export default function RegisterPage() {
  const register = useRegister();

  return (
    <>
      <Seo
        title="Create account"
        path="/register"
        description="Create your Task Manager account to organise tasks, lists, calendar planning and time tracking in a self-hosted environment."
      />
      <AuthLayout
        title="Create account"
        description="Set up your workspace account. You can change these details later."
        preview
      >
        <RegisterForm
          formData={register.formData}
          handleChange={register.handleChange}
          loading={register.loading}
          onSubmit={register.submit}
        />
      </AuthLayout>
    </>
  );
}
