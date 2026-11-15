import { Mail, X } from "@/shared/lib/icons";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/shared/ui/panel";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Avatar } from "@/shared/ui/avatar";
import { EmptyState } from "@/shared/ui/empty-state";
import { formatDate } from "@/shared/lib/formatDate";

export default function InvitationsTab({ invitations, onCancelInvitation }) {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Pending invitations</PanelTitle>
        <Badge tone="neutral">{invitations.length}</Badge>
      </PanelHeader>
      <PanelContent className="p-0">
        {invitations.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No pending invitations"
            description="Invite people from the team header to add them here."
          />
        ) : (
          invitations.map((invitation) => (
            <div
              key={invitation.id}
              data-testid="invitation-row"
              className="flex flex-col gap-3 border-b border-border px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={invitation.invitedUsername} size="sm" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {invitation.invitedUsername}
                    </span>
                    <Badge tone="warning">Pending</Badge>
                  </div>
                  <p className="text-2xs text-muted-foreground">
                    Invited by {invitation.invitedByUsername} ·{" "}
                    {formatDate(invitation.createdDate)}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCancelInvitation(invitation.id)}
                title="Cancel invitation"
                aria-label="Cancel invitation"
                className="text-danger hover:bg-danger-soft hover:text-danger"
              >
                <X size={13} aria-hidden="true" />
                Cancel
              </Button>
            </div>
          ))
        )}
      </PanelContent>
    </Panel>
  );
}
