import { useListForm } from "@/features/lists/hooks/useListForm";
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

export default function ListFormDialog({
  open,
  onOpenChange,
  mode = "create",
  initialData,
  onSaved,
  onSave,
}) {
  const form = useListForm({ open, mode, initialData, onSaved, onSave });

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
            <DialogTitle>{form.isEdit ? "Edit List" : "New List"}</DialogTitle>
            <DialogDescription>
              Group related tasks into a focused list. Use a colour to make it
              easy to recognise.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <Field
              label="Title"
              htmlFor="list-name"
              required
              error={
                form.validated && !form.formData.nameOfList.trim()
                  ? "List name is required"
                  : undefined
              }
            >
              <Input
                id="list-name"
                type="text"
                name="nameOfList"
                value={form.formData.nameOfList}
                onChange={form.handleChange}
                placeholder="Name of the list"
                autoFocus
                required
                aria-invalid={form.validated && !form.formData.nameOfList.trim()}
              />
            </Field>

            <Field label="Description" htmlFor="list-description">
              <Textarea
                id="list-description"
                name="descriptionOfList"
                value={form.formData.descriptionOfList}
                onChange={form.handleChange}
                placeholder="Description of the list"
                rows={3}
              />
            </Field>

            <Field label="Colour" htmlFor="list-color">
              <div className="flex items-center gap-3">
                <Input
                  id="list-color"
                  type="color"
                  name="color"
                  value={form.formData.color}
                  onChange={form.handleChange}
                  title="Choose a colour for the list"
                  className="h-10 w-16 cursor-pointer p-1"
                />
                <span
                  aria-hidden="true"
                  className="h-10 flex-1 rounded-sm border border-border"
                  style={{ backgroundColor: form.formData.color }}
                />
                <span className="font-mono text-2xs text-muted-foreground">
                  {form.formData.color}
                </span>
              </div>
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
              {form.submitting ? <Spinner size={14} label="Saving list" /> : null}
              {form.isEdit ? "Update" : "Create List"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
