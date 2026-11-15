import { Search } from "@/shared/lib/icons";
import { Panel, PanelContent } from "@/shared/ui/panel";
import { Button } from "@/shared/ui/button";
import { SearchInput } from "@/shared/ui/search-input";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import UserSearchResults from "@/features/admin/components/UserSearchResults";
import UserDetailDialog from "@/features/admin/components/UserDetailDialog";
import { useAdminUsers } from "@/features/admin/hooks/useAdminUsers";

export default function UserManagementTab() {
  const admin = useAdminUsers();

  return (
    <div className="space-y-4">
      <Panel>
        <PanelContent className="py-3">
          <form
            onSubmit={admin.handleSearch}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
            role="search"
          >
            <SearchInput
              value={admin.search.searchTerm}
              onChange={(event) => admin.search.setSearchTerm(event.target.value)}
              onClear={admin.handleClear}
              placeholder="Search users by username..."
              className="w-full sm:max-w-md"
            />
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm">
                <Search size={14} aria-hidden="true" />
                Search
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={admin.handleClear}>
                Clear
              </Button>
            </div>
          </form>
        </PanelContent>
      </Panel>

      <UserSearchResults
        query={admin.search.activeSearchTerm}
        refreshKey={admin.refreshKey}
        onViewUser={admin.handleViewUser}
        onToggleBlock={admin.handleToggleBlock}
      />

      <UserDetailDialog
        open={admin.userDialogOpen}
        onOpenChange={admin.setUserDialogOpen}
        user={admin.selectedUser}
      />

      <ConfirmDialog
        open={admin.confirm.open}
        onOpenChange={(open) => {
          if (!open) admin.setConfirm({ open: false });
        }}
        title={admin.confirm.title}
        description={admin.confirm.description}
        confirmLabel={admin.confirm.confirmLabel}
        onConfirm={admin.confirm.onConfirm}
        tone={admin.confirm.tone}
        loading={admin.confirming}
      />
    </div>
  );
}
