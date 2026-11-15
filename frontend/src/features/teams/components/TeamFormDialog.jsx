import { useTeamForm } from "@/features/teams/hooks/useTeamForm";
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
import { Textarea } from "@/shared/ui/textarea";
import { Spinner } from "@/shared/ui/spinner";

export default function TeamFormDialog({
  open,
  onOpenChange,
  mode = "create",
  initialData,
  onSaved,
  onSave,
}) {
  const form = useTeamForm({ open, mode, initialData, onSaved, onSave });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await form.submit();
    if (success) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{form.isEdit ? "Edit Team" : "Create Team"}</DialogTitle>
            <DialogDescription>
              Teams let you share tasks, assignments and activity with other
              people in your workspace.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <Field
              label="Team Name"
              htmlFor="team-name"
              required
              error={
                form.validated && !form.formData.name.trim()
                  ? "Team name is required"
                  : undefined
              }
            >
              <Input
                id="team-name"
                type="text"
                name="name"
                value={form.formData.name}
                onChange={form.handleChange}
                placeholder="Enter team name"
                required
                autoFocus
                aria-invalid={form.validated && !form.formData.name.trim()}
              />
            </Field>

            <Field label="Description" htmlFor="team-description">
              <Textarea
                id="team-description"
                rows={3}
                name="description"
                value={form.formData.description}
                onChange={form.handleChange}
                placeholder="Team description (optional)"
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
              {form.submitting ? <Spinner size={14} label="Saving team" /> : null}
              {form.isEdit ? "Save Changes" : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
