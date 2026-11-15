import { useCallback, useState } from "react";
import adminService from "@/services/adminService";
import { errorToast, promiseToast } from "@/shared/feedback/Noty";
import { useSearchQuery } from "@/shared/hooks/useSearchQuery";

const INITIAL_CONFIRM = { open: false };

export function useAdminUsers() {
  const search = useSearchQuery();
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [confirm, setConfirm] = useState(INITIAL_CONFIRM);
  const [confirming, setConfirming] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  const handleSearch = useCallback(
    (event) => {
      event.preventDefault();
      search.submit(event);
      refresh();
    },
    [search, refresh],
  );

  const handleClear = useCallback(() => {
    search.clear();
    refresh();
  }, [search, refresh]);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleToggleBlock = (user) => {
    const blocking = !user.blocked;
    setConfirm({
      open: true,
      title: `${blocking ? "Block" : "Unblock"} User`,
      description: `Are you sure you want to ${blocking ? "block" : "unblock"} user "${user.username}"?`,
      confirmLabel: blocking ? "Block" : "Unblock",
      tone: blocking ? "danger" : "default",
      onConfirm: async () => {
        setConfirming(true);
        try {
          await promiseToast(adminService.toggleUserBlock(user.id), {
            loading: blocking ? "Blocking user..." : "Unblocking user...",
            success: blocking ? "User blocked" : "User unblocked",
            error: () => "Error toggling user block status",
          });
          refresh();
          setConfirm(INITIAL_CONFIRM);
        } catch {
          errorToast("Error toggling user block status");
        } finally {
          setConfirming(false);
        }
      },
    });
  };

  return {
    search,
    handleSearch,
    handleClear,
    refreshKey,
    selectedUser,
    userDialogOpen,
    setUserDialogOpen,
    confirm,
    setConfirm,
    confirming,
    handleViewUser,
    handleToggleBlock,
  };
}
