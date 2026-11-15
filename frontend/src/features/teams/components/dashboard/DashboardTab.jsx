import { BarChart3, CheckCircle2, ListTodo, Timer, Users } from "@/shared/lib/icons";
import { StatStrip } from "@/shared/patterns/stat-strip";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/shared/ui/panel";
import { Progress } from "@/shared/ui/progress";
import { Avatar } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { LoadMoreSentinel } from "@/shared/patterns/load-more-sentinel";
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";

function MemberRow({ member, isAdmin, onRoleChange, onRemoveMember }) {
  return (
    <div
      data-testid="member-row"
      className="flex flex-col gap-3 border-b border-border px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={member.username} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {member.username}
          </p>
          {member.email ? (
            <p className="truncate text-xs text-muted-foreground">{member.email}</p>
          ) : null}
        </div>
        <Badge tone={member.role === "ADMIN" ? "warning" : "neutral"}>
          {member.role === "ADMIN" ? "Admin" : "Member"}
        </Badge>
      </div>

      {isAdmin ? (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={member.role === "ADMIN" ? "outline" : "secondary"}
            onClick={() =>
              onRoleChange(member.id, member.role === "ADMIN" ? "MEMBER" : "ADMIN")
            }
          >
            {member.role === "ADMIN" ? "Demote" : "Promote"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemoveMember(member)}
            aria-label="Remove member"
            title="Remove member"
            className="text-muted-foreground hover:bg-danger-soft hover:text-danger"
          >
            Remove
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardTab({
  dashboard,
  team,
  isAdmin,
  maxPending,
  onRoleChange,
  onRemoveMember,
}) {
  const members = team?.members || [];
  const { displayedItems, sentinelRef, hasMore } = useInfiniteScroll(members);

  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      <StatStrip
        items={[
          { label: "Total Tasks", value: dashboard.totalTasks, icon: ListTodo },
          { label: "Completed", value: dashboard.completedTasks, icon: CheckCircle2 },
          { label: "In Progress", value: dashboard.inProgressTasks, icon: Timer },
          { label: "Pending", value: dashboard.pendingTasks, icon: BarChart3 },
        ]}
      />

      {dashboard.totalTasks > 0 ? (
        <Panel>
          <PanelContent className="flex items-center gap-4 py-4">
            <span className="text-xs font-medium text-muted-foreground">
              Team progress
            </span>
            <Progress
              value={Math.round((dashboard.completedTasks / dashboard.totalTasks) * 100)}
              tone={dashboard.completedTasks === dashboard.totalTasks ? "success" : "brand"}
              className="flex-1"
              label="Team progress"
            />
            <span className="font-mono text-2xs tabular-nums text-muted-foreground">
              {Math.round((dashboard.completedTasks / dashboard.totalTasks) * 100)}%
            </span>
          </PanelContent>
        </Panel>
      ) : null}

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BarChart3 size={16} aria-hidden="true" />
          Team workload
        </h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.members.map((member) => (
            <Panel key={member.id} className="p-4">
              <div className="flex items-center gap-3">
                <Avatar name={member.username} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {member.username}
                  </p>
                  <p className="text-2xs text-muted-foreground">
                    {member.role === "ADMIN" ? "Admin" : "Member"}
                  </p>
                </div>
                <span className="font-mono text-xs tabular-nums text-foreground">
                  {member.pendingTasks}
                </span>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-2xs text-muted-foreground">
                  <span>Pending tasks</span>
                  <span>{member.pendingTasks}</span>
                </div>
                <Progress
                  value={maxPending > 0 ? (member.pendingTasks / maxPending) * 100 : 0}
                  tone={
                    member.pendingTasks / maxPending > 0.8
                      ? "danger"
                      : member.pendingTasks / maxPending > 0.5
                        ? "warning"
                        : "success"
                  }
                  label={`${member.username} pending tasks`}
                />
              </div>
            </Panel>
          ))}
        </div>
      </section>

      <section>
        <Panel>
          <PanelHeader>
            <PanelTitle>Members</PanelTitle>
            <Badge tone="neutral">
              <Users size={12} aria-hidden="true" />
              {members.length}
            </Badge>
          </PanelHeader>
          <PanelContent className="p-0">
            {members.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No members yet"
                description="Invite people to collaborate on this team."
              />
            ) : (
              <>
                {displayedItems.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isAdmin={isAdmin}
                    onRoleChange={onRoleChange}
                    onRemoveMember={onRemoveMember}
                  />
                ))}
                <LoadMoreSentinel
                  sentinelRef={sentinelRef}
                  hasMore={hasMore}
                  loading={false}
                />
              </>
            )}
          </PanelContent>
        </Panel>
      </section>
    </div>
  );
}

export default DashboardTab;
