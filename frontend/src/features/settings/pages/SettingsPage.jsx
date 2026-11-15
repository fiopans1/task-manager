import { PageContainer } from "@/shared/patterns/page-container";
import { PageHeader } from "@/shared/patterns/page-header";
import ProfileForm from "@/features/settings/components/ProfileForm";

export default function SettingsPage() {
  return (
    <PageContainer>
      <div className="space-y-5">
        <PageHeader
          meta="System / Settings"
          title="Settings"
          description="Manage your profile and account security."
        />
        <ProfileForm />
      </div>
    </PageContainer>
  );
}
