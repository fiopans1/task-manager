import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirm deletion",
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  tone = "danger",
  loading = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-sm border border-danger/20 bg-danger-soft text-danger">
              <AlertTriangle size={18} aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Spinner size={14} label="Working" /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
