import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Mail, Plus } from "@/shared/lib/icons";
import { CollectionPage } from "@/shared/patterns/collection-page";
import { PageHeader } from "@/shared/patterns/page-header";
import { SearchToolbar } from "@/shared/patterns/search-toolbar";
import { Button } from "@/shared/ui/button";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/shared/ui/panel";
import { ListRowsSkeleton } from "@/shared/patterns/panel-skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { TeamCollection } from "@/features/teams/components/TeamCollection";
import TeamFormDialog from "@/features/teams/components/TeamFormDialog";
import { DEFAULT_TEAM_FILTERS, TeamFilters } from "@/features/teams/components/TeamFilters";
import { useTeamsPage } from "@/features/teams/hooks/useTeamsPage";
import { errorToast } from "@/shared/feedback/Noty";

export default function TeamsPage() {
  const page = useTeamsPage();
  const [filters, setFilters] = useState(DEFAULT_TEAM_FILTERS);

  return (
    <CollectionPage
      header={
        <PageHeader
          meta="Workspace / Teams"
          title="Teams"
          description="A roster of the people and shared work moving through your workspace."
          actions={
            <Button className="w-full sm:w-auto" onClick={page.dialog.openCreate}>
              <Plus size={16} aria-hidden="true" />
              New Team
            </Button>
          }
        />
      }
      toolbar={
        <SearchToolbar
          searchTerm={page.search.searchTerm}
          onSearchTermChange={(event) => page.search.setSearchTerm(event.target.value)}
          onSubmit={page.search.submit}
          onClear={page.search.clear}
          onRefresh={page.refreshAll}
          placeholder="Search teams"
          filters={
            <TeamFilters
              value={filters}
              onChange={setFilters}
              onClear={() => setFilters(DEFAULT_TEAM_FILTERS)}
            />
          }
        />
      }
    >
      {page.invitationsLoading ? (
        <Panel aria-busy="true">
          <PanelHeader>
            <PanelTitle>Pending invitations</PanelTitle>
            <Skeleton className="h-5 w-10" />
          </PanelHeader>
          <PanelContent className="p-0">
            <ListRowsSkeleton rows={2} />
          </PanelContent>
        </Panel>
      ) : page.pendingInvitations.length > 0 ? (
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <PanelTitle>Pending invitations</PanelTitle>
              <Badge tone="info">{page.pendingInvitations.length}</Badge>
            </div>
          </PanelHeader>
          <PanelContent className="p-0">
            {page.pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                data-testid="pending-invitation-row"
                className="flex flex-col gap-3 border-b border-border px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-border bg-surface-2 text-info">
                    <Mail size={15} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {invitation.teamName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Invited by {invitation.invitedByUsername}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => page.respondToInvitation(invitation.token, true)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => page.respondToInvitation(invitation.token, false)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </PanelContent>
        </Panel>
      ) : null}

      <ErrorBoundary
        resetKeys={[page.search.refreshKey]}
        onError={(error) => errorToast(`Error: ${error.message}`)}
        fallback={
          <Panel>
            <EmptyState
              title="Could not load teams"
              description="There was an error loading your teams. Try again."
              action={<Button onClick={page.refreshAll}>Try Again</Button>}
            />
          </Panel>
        }
      >
        <TeamCollection
          searchTerm={page.search.activeSearchTerm}
          refreshKey={page.search.refreshKey}
          filters={filters}
          onOpen={page.openTeam}
          onEdit={page.openEdit}
          onChanged={page.refreshAll}
          onCreate={page.dialog.openCreate}
          onClearFilters={() => setFilters(DEFAULT_TEAM_FILTERS)}
        />
      </ErrorBoundary>

      <TeamFormDialog
        open={page.dialog.open}
        onOpenChange={page.dialog.setOpen}
        mode={page.dialog.mode}
        initialData={page.dialog.data}
        onSaved={page.refreshAll}
      />
    </CollectionPage>
  );
}
