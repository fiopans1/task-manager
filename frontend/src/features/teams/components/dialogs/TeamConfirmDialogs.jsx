import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

export function RemoveMemberDialog({ open, onOpenChange, member, onConfirm, loading }) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Remove Member"
      description={
        member
          ? `Are you sure you want to remove ${member.username} from this team? Their assigned tasks will be unassigned.`
          : "This action cannot be undone."
      }
      confirmLabel="Remove"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}

export function DeleteTeamDialog({ open, onOpenChange, team, onConfirm, loading }) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete team"
      description={
        team
          ? `Are you sure you want to delete ${team.name}? All tasks will be removed from the team but will remain in their owners' task lists. This action cannot be undone.`
          : "This action cannot be undone."
      }
      confirmLabel="Delete team"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}

export function LeaveTeamDialog({ open, onOpenChange, team, onConfirm, loading }) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Leave Team"
      description={
        team
          ? `Are you sure you want to leave ${team.name}? Your tasks will be removed from the team.`
          : "This action cannot be undone."
      }
      confirmLabel="Leave Team"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}
