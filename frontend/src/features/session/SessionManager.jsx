import { AlertTriangle } from "@/shared/lib/icons";
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
import { useIdleSession } from "@/features/session/useIdleSession";

export default function SessionManager({ onLogOut }) {
  const session = useIdleSession({ onLogOut });

  return (
    <Dialog open={session.showModal} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-sm"
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle size={17} className="text-warning" aria-hidden="true" />
            <DialogTitle>Still There?</DialogTitle>
          </div>
          <DialogDescription>
            You have been inactive for a while. Do you want to stay signed in?
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-2 text-center">
          <p
            className="font-mono text-4xl font-semibold tabular-nums text-danger"
            aria-live="polite"
          >
            {session.formatTime(session.countdown)}
          </p>
          <p className="text-xs text-muted-foreground">
            You will be automatically logged out if you do not respond.
          </p>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={session.handleForceLogout}>
            Logout
          </Button>
          <Button onClick={session.handleExtendSession}>Extend Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
