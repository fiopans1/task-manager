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
import { Spinner } from "@/shared/ui/spinner";

export function InviteMemberDialog({
  open,
  onOpenChange,
  username,
  setUsername,
  validated,
  onSubmit,
  pending,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              The user will receive an in-app invitation to accept or reject.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field
              label="Username"
              htmlFor="invite-username"
              required
              error={
                validated && (!username || username.trim() === "")
                  ? "Username is required"
                  : undefined
              }
              hint="They must already have an account in this instance."
            >
              <Input
                id="invite-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username to invite"
                required
                autoFocus
                aria-invalid={validated && (!username || username.trim() === "")}
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner size={14} label="Sending invitation" /> : null}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
