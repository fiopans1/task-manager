import { useTaskForm } from "@/features/tasks/hooks/useTaskForm";
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
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Switch } from "@/shared/ui/switch";
import { Alert } from "@/shared/ui/alert";
import { Spinner } from "@/shared/ui/spinner";
import { Collapsible, CollapsibleContent } from "@/shared/ui/collapsible";
import { PRIORITY_META, STATE_META } from "@/shared/ui/status-badge";

const PRIORITY_OPTIONS = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "MIN"];
const STATUS_OPTIONS = [
  "NEW",
  "IN_PROGRESS",
  "PAUSSED",
  "COMPLETED",
  "CANCELLED",
];

export default function TaskFormDialog({
  open,
  onOpenChange,
  mode = "create",
  initialData,
  onSaved,
  onSave,
}) {
  const form = useTaskForm({ open, mode, initialData, onSaved, onSave });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await form.submit();
    if (success) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="task-modal max-w-2xl">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{form.isEdit ? "Edit Task" : "New Task"}</DialogTitle>
            <DialogDescription>
              {form.isEdit
                ? "Update the task details or schedule."
                : "Add a task to your workspace. Turn it into an event to reserve time."}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-5">
            <Field
              label="Name"
              htmlFor="task-name"
              required
              error={
                form.validated && !form.formData.nameOfTask.trim()
                  ? "Task name is required"
                  : undefined
              }
            >
              <Input
                id="task-name"
                name="nameOfTask"
                placeholder="Name of task"
                value={form.formData.nameOfTask}
                onChange={form.handleChange}
                aria-invalid={
                  form.validated && !form.formData.nameOfTask.trim()
                }
                required
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Priority" htmlFor="task-priority">
                <Select
                  id="task-priority"
                  name="priority"
                  aria-label="Priority"
                  value={form.formData.priority}
                  onChange={form.handleChange}
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {PRIORITY_META[option].label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Status" htmlFor="task-status">
                <Select
                  id="task-status"
                  name="state"
                  aria-label="Status"
                  value={form.formData.state}
                  onChange={form.handleChange}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {STATE_META[option].label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="rounded-md border border-border bg-card px-4 py-3">
              <Switch
                id="event-switch"
                label="Reserve time on calendar"
                description="Creates a dated event so the time is blocked out."
                checked={form.isEvent}
                onChange={form.handleEventToggle}
              />
            </div>

            <Collapsible open={form.isEvent}>
              <CollapsibleContent>
                <div className="space-y-4 rounded-md border border-border bg-surface-2 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Start Event" htmlFor="task-start-date">
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <Input
                          id="task-start-date"
                          type="date"
                          aria-label="Start date"
                          value={form.dateFields.startDate}
                          onChange={form.setDateField("startDate")}
                        />
                        <Input
                          type="time"
                          aria-label="Start time"
                          value={form.dateFields.startTime}
                          onChange={form.setDateField("startTime")}
                        />
                      </div>
                    </Field>
                    <Field label="End Event" htmlFor="task-end-date">
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <Input
                          id="task-end-date"
                          type="date"
                          aria-label="End date"
                          value={form.dateFields.endDate}
                          onChange={form.setDateField("endDate")}
                        />
                        <Input
                          type="time"
                          aria-label="End time"
                          value={form.dateFields.endTime}
                          onChange={form.setDateField("endTime")}
                        />
                      </div>
                    </Field>
                  </div>

                  {form.dateError ? (
                    <Alert tone="danger">{form.dateError}</Alert>
                  ) : null}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Field label="Description" htmlFor="task-description">
              <Textarea
                id="task-description"
                name="descriptionOfTask"
                rows={4}
                placeholder="Add context, links or next steps..."
                value={form.formData.descriptionOfTask}
                onChange={form.handleChange}
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
              {form.submitting ? (
                <Spinner size={14} label="Saving task" />
              ) : null}
              {form.isEdit ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
