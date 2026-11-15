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

export function AddTaskDialog({
  open,
  onOpenChange,
  tasks,
  selectedTaskId,
  setSelectedTaskId,
  validated,
  onSubmit,
  pending,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add Task to Team</DialogTitle>
            <DialogDescription>
              Only your tasks that are not already in a team are shown.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field
              label="Select Task"
              htmlFor="team-task-select"
              required
              error={validated && !selectedTaskId ? "Please select a task" : undefined}
            >
              <Select
                id="team-task-select"
                value={selectedTaskId}
                onChange={(event) => setSelectedTaskId(event.target.value)}
                required
                aria-invalid={validated && !selectedTaskId}
              >
                <option value="">Select a task...</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.nameOfTask}
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
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner size={14} label="Adding task" /> : null}
              Add to Team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
