import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Plus } from "@/shared/lib/icons";
import { CollectionPage } from "@/shared/patterns/collection-page";
import { PageHeader } from "@/shared/patterns/page-header";
import { SearchToolbar } from "@/shared/patterns/search-toolbar";
import { Button } from "@/shared/ui/button";
import { Panel } from "@/shared/ui/panel";
import { EmptyState } from "@/shared/ui/empty-state";
import { ListCollection } from "@/features/lists/components/ListCollection";
import ListFormDialog from "@/features/lists/components/ListFormDialog";
import { DEFAULT_LIST_FILTERS, ListFilters } from "@/features/lists/components/ListFilters";
import { useListsPage } from "@/features/lists/hooks/useListsPage";
import { errorToast } from "@/shared/feedback/Noty";

export default function ListsPage() {
  const page = useListsPage();
  const [filters, setFilters] = useState(DEFAULT_LIST_FILTERS);

  return (
    <CollectionPage
      header={
        <PageHeader
          meta="Workspace / Lists"
          title="My Lists"
          description="Group work into colour-coded collections with a clear progress signal."
          actions={
            <Button className="w-full sm:w-auto" onClick={page.dialog.openCreate}>
              <Plus size={16} aria-hidden="true" />
              New List
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
          placeholder="Search lists"
          filters={
            <ListFilters
              value={filters}
              onChange={setFilters}
              onClear={() => setFilters(DEFAULT_LIST_FILTERS)}
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
              title="Could not load lists"
              description="There was an error loading your lists. Try again."
              action={<Button onClick={page.search.refresh}>Try Again</Button>}
            />
          </Panel>
        }
      >
        <ListCollection
          searchTerm={page.search.activeSearchTerm}
          refreshKey={page.search.refreshKey}
          filters={filters}
          onOpen={page.openList}
          onEdit={page.openEdit}
          onChanged={page.search.refresh}
          onCreate={page.dialog.openCreate}
          onClearFilters={() => setFilters(DEFAULT_LIST_FILTERS)}
        />
      </ErrorBoundary>

      <ListFormDialog
        open={page.dialog.open}
        onOpenChange={page.dialog.setOpen}
        mode={page.dialog.mode}
        initialData={page.dialog.data}
        onSaved={page.search.refresh}
      />
    </CollectionPage>
  );
}
