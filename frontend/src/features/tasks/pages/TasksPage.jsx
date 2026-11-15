import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Plus } from "@/shared/lib/icons";
import { CollectionPage } from "@/shared/patterns/collection-page";
import { PageHeader } from "@/shared/patterns/page-header";
import { SearchToolbar } from "@/shared/patterns/search-toolbar";
import { Button } from "@/shared/ui/button";
import { Panel } from "@/shared/ui/panel";
import { EmptyState } from "@/shared/ui/empty-state";
import { TaskCollection } from "@/features/tasks/components/TaskCollection";
import { DEFAULT_TASK_FILTERS, TaskFilters } from "@/features/tasks/components/TaskFilters";
import TaskFormDialog from "@/features/tasks/components/TaskFormDialog";
import { useTasksPage } from "@/features/tasks/hooks/useTasksPage";
import { errorToast } from "@/shared/feedback/Noty";

export default function TasksPage() {
  const page = useTasksPage();
  const [filters, setFilters] = useState(DEFAULT_TASK_FILTERS);

  return (
    <CollectionPage
      className="pb-24 sm:pb-6"
      header={
        <PageHeader
          meta="Workspace / Tasks"
          title="My Tasks"
          description="A single ledger for your work, events and daily priorities."
          actions={
            <Button className="hidden sm:inline-flex" onClick={page.dialog.openCreate}>
              <Plus size={16} aria-hidden="true" />
              New Task
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
          onRefresh={page.search.refresh}
          placeholder="Search tasks"
          filters={
            <TaskFilters
              value={filters}
              onChange={setFilters}
              onClear={() => setFilters(DEFAULT_TASK_FILTERS)}
            />
          }
        />
      }
    >
      <ErrorBoundary
        resetKeys={[page.search.refreshKey]}
        onError={(error) => errorToast(`Error: ${error.message}`)}
        fallback={
          <Panel>
            <EmptyState
              title="Could not load tasks"
              description="There was an error loading your tasks. Try again."
              action={
                <Button onClick={page.search.refresh}>Try Again</Button>
              }
            />
          </Panel>
        }
      >
        <TaskCollection
          searchTerm={page.search.activeSearchTerm}
          refreshKey={page.search.refreshKey}
          filters={filters}
          onOpen={page.openTask}
          onEdit={page.openEdit}
          onChanged={page.search.refresh}
          onCreate={page.dialog.openCreate}
          onClearFilters={() => setFilters(DEFAULT_TASK_FILTERS)}
        />
      </ErrorBoundary>

      <TaskFormDialog
        open={page.dialog.open}
        onOpenChange={page.dialog.setOpen}
        mode={page.dialog.mode}
        initialData={page.dialog.data}
        onSaved={page.search.refresh}
      />

      <button
        type="button"
        onClick={page.dialog.openCreate}
        aria-label="New task"
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-overlay transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 sm:hidden"
      >
        <Plus size={22} aria-hidden="true" />
      </button>
    </CollectionPage>
  );
}
