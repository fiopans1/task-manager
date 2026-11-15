import { useEffect, useState } from "react";
import adminService from "@/services/adminService";
import { errorToast, promiseToast } from "@/shared/feedback/Noty";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/shared/ui/panel";
import { Switch } from "@/shared/ui/switch";
import { Checkbox } from "@/shared/ui/checkbox";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Alert } from "@/shared/ui/alert";
import { Skeleton } from "@/shared/ui/skeleton";

export default function SystemMessageTab() {
  const [message, setMessage] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [showBeforeLogin, setShowBeforeLogin] = useState(false);
  const [showAfterLogin, setShowAfterLogin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getSystemMessage();
        setMessage(data.message || "");
        setEnabled(data.enabled || false);
        setShowBeforeLogin(data.showBeforeLogin || false);
        setShowAfterLogin(data.showAfterLogin !== false);
      } catch {
        errorToast("Error loading system message");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await promiseToast(
        adminService.updateSystemMessage(
          message,
          enabled,
          showBeforeLogin,
          showAfterLogin,
        ),
        {
          loading: "Saving system message...",
          success: "System message updated",
          error: () => "Error saving system message",
        },
      );
      setMessage(updated.message || "");
      setEnabled(updated.enabled || false);
      setShowBeforeLogin(updated.showBeforeLogin || false);
      setShowAfterLogin(updated.showAfterLogin !== false);
    } catch {
      errorToast("Error saving system message");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>System Message</PanelTitle>
        <span className="text-xs text-muted-foreground">
          Shown to users on the pages you choose.
        </span>
      </PanelHeader>
      <PanelContent className="space-y-5">
        <p className="text-xs leading-5 text-muted-foreground">
          Configure a message for users. It can appear before login, after login,
          or both.
        </p>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            <div className="rounded-md border border-border bg-surface-2 px-4 py-3">
              <Switch
                id="system-message-switch"
                label={enabled ? "Message is active" : "Message is inactive"}
                checked={enabled}
                onChange={(event) => setEnabled(event.target.checked)}
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="mb-2 text-xs font-medium text-foreground">
                Visibility
              </legend>
              <label
                htmlFor="show-before-login"
                className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
              >
                <Checkbox
                  id="show-before-login"
                  checked={showBeforeLogin}
                  onChange={(event) => setShowBeforeLogin(event.target.checked)}
                />
                Show before login (on the public home page)
              </label>
              <label
                htmlFor="show-after-login"
                className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
              >
                <Checkbox
                  id="show-after-login"
                  checked={showAfterLogin}
                  onChange={(event) => setShowAfterLogin(event.target.checked)}
                />
                Show after login (inside application)
              </label>
            </fieldset>

            <div className="space-y-1.5">
              <label
                htmlFor="system-message-content"
                className="text-xs font-medium text-foreground"
              >
                Message Content
              </label>
              <Textarea
                id="system-message-content"
                rows={4}
                placeholder="Enter the message to display to users..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>

            {message ? (
              <Alert tone="info" title="Preview">
                {message}
              </Alert>
            ) : null}

            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Message"}
            </Button>
          </>
        )}
      </PanelContent>
    </Panel>
  );
}
