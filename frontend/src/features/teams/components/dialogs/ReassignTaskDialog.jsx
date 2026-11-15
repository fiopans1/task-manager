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
import { Select } from "@/shared/ui/select";
import { Spinner } from "@/shared/ui/spinner";

export function ReassignTaskDialog({
  open,
  onOpenChange,
  task,
  team,
  target,
  setTarget,
  validated,
  onSubmit,
  pending,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Reassign Task</DialogTitle>
            <DialogDescription>
              Move ownership of this task to another team member.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {task ? (
              <div className="rounded-md border border-border bg-surface-2 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Task</p>
                <p className="text-sm font-medium text-foreground">{task.nameOfTask}</p>
                {task.user ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Current owner: <span className="text-foreground">{task.user}</span>
                  </p>
                ) : null}
              </div>
            ) : null}

            <Field
              label="Reassign to"
              htmlFor="reassign-target"
              required
              error={
                validated && !target ? "Please select a team member" : undefined
              }
            >
              <Select
                id="reassign-target"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                required
                aria-invalid={validated && !target}
              >
                <option value="">Select a member...</option>
                {team?.members
                  ?.filter((member) => member.username !== task?.user)
                  .map((member) => (
                    <option key={member.id} value={member.username}>
                      {member.username} ({member.role === "ADMIN" ? "Admin" : "Member"})
                    </option>
                  ))}
              </Select>
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
            <Button type="submit" disabled={!target || pending}>
              {pending ? <Spinner size={14} label="Reassigning task" /> : null}
              Reassign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
