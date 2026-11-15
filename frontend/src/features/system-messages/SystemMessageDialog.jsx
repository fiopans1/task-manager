import { useEffect, useState } from "react";
import { Megaphone } from "@/shared/lib/icons";
import adminService from "@/services/adminService";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";

export default function SystemMessageDialog({ context = "afterLogin" }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSystemMessage = async () => {
      try {
        const config = await adminService.getPublicConfig();
        const systemMessage = config.systemMessage;
        if (!systemMessage?.enabled || !systemMessage.message) return;

        const shouldShow =
          (context === "afterLogin" && systemMessage.showAfterLogin !== false) ||
          (context === "beforeLogin" && systemMessage.showBeforeLogin === true);

        if (shouldShow) {
          setMessage(systemMessage.message);
          setOpen(true);
        }
      } catch (error) {
        console.debug("Could not load system message:", error);
      }
    };

    loadSystemMessage();
  }, [context]);

  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Megaphone size={17} className="text-brand" aria-hidden="true" />
            <DialogTitle>System Notification</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Important message from the administrator
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Alert tone="info">{message}</Alert>
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
