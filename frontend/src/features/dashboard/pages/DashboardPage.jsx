import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/shared/patterns/page-container";
import { PageHeader } from "@/shared/patterns/page-header";
import { StatStrip } from "@/shared/patterns/stat-strip";
import { QuickAccess } from "@/features/dashboard/components/QuickAccess";
import { RecentTasksPanel } from "@/features/dashboard/components/RecentTasksPanel";
import { UpcomingEventsPanel } from "@/features/dashboard/components/UpcomingEventsPanel";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";
import { Button } from "@/shared/ui/button";
import { Alert } from "@/shared/ui/alert";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListChecks,
  ListTodo,
} from "@/shared/lib/icons";

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { summary, loading, error, reload } = useDashboardSummary();

  const recentTasks = summary?.recentTasks ?? [];
  const nextEvents = summary?.nextEvents ?? [];
  const completedCount = recentTasks.filter((task) => task.state === "COMPLETED").length;
  const totalRecent = recentTasks.length;
  const completionPct =
    totalRecent > 0 ? Math.round((completedCount / totalRecent) * 100) : 0;

  return (
    <PageContainer className="flex min-h-[calc(100dvh-3.5rem)] flex-col pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:min-h-dvh md:pb-6">
      <div className="flex flex-1 flex-col gap-6">
        <PageHeader
          meta="Workspace / Overview"
          title="Task Manager"
          description={`${formatToday()} · Your workspace at a glance.`}
          actions={
            <Button variant="outline" onClick={reload} disabled={loading}>
              Refresh
            </Button>
          }
        />

        {error ? (
          <Alert tone="danger" title="The dashboard could not be loaded">
            {error}
          </Alert>
        ) : null}

        <StatStrip
          loading={loading}
          items={[
            {
              label: "Total tasks",
              value: summary?.totalTasks ?? 0,
              icon: ListTodo,
            },
            {
              label: "Lists created",
              value: summary?.totalLists ?? 0,
              icon: ListChecks,
            },
            {
              label: "Upcoming events",
              value: nextEvents.length,
              icon: CalendarCheck,
            },
            {
              label: "Recent completion",
              value: `${completionPct}%`,
              icon: CheckCircle2,
              hint: `${completedCount}/${totalRecent} recent tasks`,
            },
          ]}
        />

        <QuickAccess />

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentTasksPanel
            tasks={recentTasks}
            loading={loading}
            error={error}
            completed={completedCount}
            total={totalRecent}
            progress={completionPct}
          />
          <UpcomingEventsPanel
            events={nextEvents}
            loading={loading}
            error={error}
            onOpen={(id) => navigate(`/home/tasks/${id}`)}
          />
        </div>

        <div
          data-testid="dashboard-footer"
          className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-4 text-2xs text-muted-foreground"
        >
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={12} aria-hidden="true" />
              Calendar planning
            </span>
            <span className="flex items-center gap-1.5">
              <ListChecks size={12} aria-hidden="true" />
              Custom lists
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} aria-hidden="true" />
              Time tracking
            </span>
          </div>
          <span className="font-mono">© 2025 TaskManager · Created by fiopans1</span>
        </div>
      </div>
    </PageContainer>
  );
}
