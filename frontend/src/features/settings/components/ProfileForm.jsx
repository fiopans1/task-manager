import { KeyRound } from "@/shared/lib/icons";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/shared/ui/panel";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert } from "@/shared/ui/alert";
import { Spinner } from "@/shared/ui/spinner";
import { useProfile } from "@/features/settings/hooks/useProfile";
import ChangePasswordDialog from "@/features/settings/components/ChangePasswordDialog";

export default function ProfileForm() {
  const profile = useProfile();

  if (profile.loading) {
    return (
      <Panel className="space-y-3 p-5">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-9 w-32" />
      </Panel>
    );
  }

  if (profile.loadError) {
    return (
      <Alert tone="danger" title="Profile unavailable">
        {profile.loadError}
      </Alert>
    );
  }

  return (
    <>
      <Panel>
        <PanelHeader>
          <div>
            <PanelTitle>Personal information</PanelTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Update the name, username and email associated with your account.
            </p>
          </div>
        </PanelHeader>
        <PanelContent>
          <form onSubmit={profile.submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="First Name" htmlFor="profile-name">
                <Input
                  id="profile-name"
                  type="text"
                  name="name"
                  value={profile.form.name}
                  onChange={profile.handleChange}
                />
              </Field>
              <Field label="Last name" htmlFor="profile-surname1">
                <Input
                  id="profile-surname1"
                  type="text"
                  name="surname1"
                  value={profile.form.surname1}
                  onChange={profile.handleChange}
                />
              </Field>
              <Field label="Second last name" htmlFor="profile-surname2" hint="Optional">
                <Input
                  id="profile-surname2"
                  type="text"
                  name="surname2"
                  value={profile.form.surname2}
                  onChange={profile.handleChange}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Username" htmlFor="profile-username">
                <Input
                  id="profile-username"
                  type="text"
                  name="username"
                  value={profile.form.username}
                  onChange={profile.handleChange}
                  required
                />
              </Field>
              <Field
                label="Email"
                htmlFor="profile-email"
                hint={
                  !profile.canChangeEmail
                    ? "Your email is managed by your sign-in provider."
                    : undefined
                }
              >
                <Input
                  id="profile-email"
                  type="email"
                  name="email"
                  value={profile.form.email}
                  onChange={profile.handleChange}
                  disabled={!profile.canChangeEmail}
                  required
                />
              </Field>
            </div>

            <Button type="submit" disabled={profile.saving}>
              {profile.saving ? <Spinner size={14} label="Saving profile" /> : null}
              Save changes
            </Button>
          </form>
        </PanelContent>
      </Panel>

      <Panel>
        <PanelHeader>
          <div>
            <PanelTitle>Password</PanelTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose a strong password you do not use anywhere else.
            </p>
          </div>
        </PanelHeader>
        <PanelContent>
          {profile.canChangePassword ? (
            <Button
              variant="outline"
              onClick={() => profile.setPasswordOpen(true)}
            >
              <KeyRound size={15} aria-hidden="true" />
              Change password
            </Button>
          ) : (
            <Alert tone="info">
              Your password is managed by your sign-in provider.
            </Alert>
          )}
        </PanelContent>
      </Panel>

      <ChangePasswordDialog
        open={profile.passwordOpen}
        onOpenChange={profile.setPasswordOpen}
      />
    </>
  );
}
