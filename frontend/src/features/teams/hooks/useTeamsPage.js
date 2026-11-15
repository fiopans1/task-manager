import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import teamService from "@/services/teamService";
import { errorToast, promiseToast } from "@/shared/feedback/Noty";
import { useSearchQuery } from "@/shared/hooks/useSearchQuery";
import { useEntityDialog } from "@/shared/hooks/useEntityDialog";

export function useTeamsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = useSearchQuery();
  const dialog = useEntityDialog();
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);

  const loadPendingInvitations = useCallback(async () => {
    setInvitationsLoading(true);
    try {
      const data = await teamService.getMyPendingInvitations();
      setPendingInvitations(data);
    } catch {
      setPendingInvitations([]);
    } finally {
      setInvitationsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingInvitations();
  }, [loadPendingInvitations]);

  const respondToInvitation = useCallback(
    async (token, accept) => {
      try {
        await promiseToast(teamService.respondToInvitation(token, accept), {
          loading: accept ? "Accepting invitation..." : "Rejecting invitation...",
          success: accept ? "Invitation accepted" : "Invitation rejected",
          error: () => "Error responding to invitation",
        });
        await loadPendingInvitations();
        if (accept) search.refresh();
      } catch {
        errorToast("Error responding to invitation");
      }
    },
    [loadPendingInvitations, search],
  );

  const refreshAll = useCallback(() => {
    search.refresh();
    loadPendingInvitations();
  }, [search, loadPendingInvitations]);

  return {
    search,
    dialog,
    pendingInvitations,
    invitationsLoading,
    loadPendingInvitations,
    respondToInvitation,
    refreshAll,
    openTeam: (id) => navigate(`${location.pathname}/${id}`),
    openEdit: dialog.openEdit,
  };
}
