import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Alert } from "@/shared/ui/alert";
import { Spinner } from "@/shared/ui/spinner";
import { useChangePassword } from "@/features/settings/hooks/useChangePassword";

export default function ChangePasswordDialog({ open, onOpenChange }) {
  const form = useChangePassword({
    open,
    onClose: () => onOpenChange(false),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!form.submitting) onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-md" showCloseButton={!form.submitting}>
        <form onSubmit={form.submit} noValidate>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Choose a strong password you do not use anywhere else.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <Alert tone="warning" data-testid="change-password-warning">
              Changing your password will close <strong>all active sessions</strong>,
              including this one. You will be redirected to the login page and must
              sign in again with your new password.
            </Alert>

            <Field label="Current password" htmlFor="current-password">
              <Input
                id="current-password"
                type="password"
                name="currentPassword"
                value={form.form.currentPassword}
                onChange={form.handleChange}
                autoComplete="current-password"
                required
              />
            </Field>

            <Field
              label="New password"
              htmlFor="new-password"
              hint="At least 8 characters with one uppercase letter, one lowercase letter, one number and one special character."
            >
              <Input
                id="new-password"
                type="password"
                name="newPassword"
                value={form.form.newPassword}
                onChange={form.handleChange}
                autoComplete="new-password"
                required
              />
            </Field>

            <Field label="Confirm new password" htmlFor="confirm-new-password">
              <Input
                id="confirm-new-password"
                type="password"
                name="confirmPassword"
                value={form.form.confirmPassword}
                onChange={form.handleChange}
                autoComplete="new-password"
                required
              />
            </Field>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.submitting}>
              {form.submitting ? <Spinner size={14} label="Updating password" /> : null}
              Update password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
