import {
  ArrowUpDown,
  CheckCircle2,
  CirclePlay,
  CircleStop,
  ClipboardList,
  MessageSquareText,
  Pencil,
  Plus,
  RefreshCw,
  UserRound,
} from "@/shared/lib/icons";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/shared/ui/panel";
import { Button } from "@/shared/ui/button";
import { SearchInput } from "@/shared/ui/search-input";
import { ActivityTimeline } from "@/shared/patterns/activity-timeline";
import { MentionText, default as MentionTextarea } from "@/shared/ui/mention-textarea";
import { Textarea } from "@/shared/ui/textarea";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Spinner } from "@/shared/ui/spinner";
import { formatDateTime } from "@/shared/lib/formatDate";
import { useTaskActions } from "@/features/tasks/hooks/useTaskActions";
import { cn } from "@/shared/lib/utils";

const ACTION_META = {
  create: { icon: CheckCircle2, tone: "success" },
  update: { icon: Pencil, tone: "brand" },
  comment: { icon: MessageSquareText, tone: "info" },
  timer_started: { icon: CirclePlay, tone: "success" },
  timer_stopped: { icon: CircleStop, tone: "neutral" },
};

function metaFor(actionType) {
  return (
    ACTION_META[String(actionType ?? "").toLowerCase()] ?? {
      icon: ClipboardList,
      tone: "neutral",
    }
  );
}

export default function TaskActionsPanel({
  taskId,
  teamId,
  externalRefreshKey,
  className,
}) {
  const actions = useTaskActions({ taskId, teamId, externalRefreshKey });

  const timelineItems = actions.actions.map((action) => {
    const meta = metaFor(action.actionType);

    return {
      id: action.id,
      icon: meta.icon,
      tone: meta.tone,
      title: action.actionName,
      description: <MentionText text={action.actionDescription} />,
      meta: (
        <>
          <span className="inline-flex items-center gap-1">
            <UserRound size={12} aria-hidden="true" />
            {action.user}
          </span>
          <span className="font-mono">{formatDateTime(action.actionDate)}</span>
        </>
      ),
    };
  });

  return (
    <>
      <Panel className={cn("flex flex-col", className)}>
        <PanelHeader className="gap-3">
          <PanelTitle>Action History</PanelTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={actions.refresh}
              aria-label="Refresh action history"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Refresh
            </Button>
            <Button size="sm" onClick={actions.openModal}>
              <Plus size={14} aria-hidden="true" />
              New Action
            </Button>
          </div>
        </PanelHeader>

        <div className="flex flex-col gap-2 border-b border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={actions.searchTerm}
            onChange={(event) => actions.setSearchTerm(event.target.value)}
            onClear={() => actions.setSearchTerm("")}
            placeholder="Search actions..."
            className="w-full sm:max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                id="dropdown-sort"
                variant="outline"
                size="sm"
                className="justify-between gap-2 sm:min-w-40"
              >
                <span className="inline-flex items-center gap-1.5">
                  <ArrowUpDown size={14} aria-hidden="true" />
                  {actions.sortOrder === "newest" ? "Newest first" : "Oldest first"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => actions.setSortOrder("newest")}>
                Newest first
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => actions.setSortOrder("oldest")}>
                Oldest first
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <PanelContent className="flex-1">
          {actions.initialLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <ActivityTimeline
              items={timelineItems}
              emptyTitle="No actions for this task"
              emptyDescription={
                actions.searchTerm
                  ? "No actions match this search."
                  : "No actions have been recorded for this task yet."
              }
            />
          )}
        </PanelContent>
      </Panel>

      <Dialog
        open={actions.modalOpen}
        onOpenChange={(open) => {
          if (!open) actions.closeModal();
        }}
      >
        <DialogContent className="max-w-lg">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              actions.saveAction();
            }}
          >
            <DialogHeader>
              <DialogTitle>New Action</DialogTitle>
              <DialogDescription>
                Record a comment or an update for this task.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <Field label="Action title" htmlFor="action-name" required>
                <Input
                  id="action-name"
                  type="text"
                  name="actionName"
                  value={actions.newAction.actionName}
                  onChange={actions.handleInputChange}
                  placeholder="E.g: Priority update"
                  autoFocus
                />
              </Field>

              <Field
                label="Description"
                htmlFor="action-description"
                hint={
                  actions.teamMembers.length > 0
                    ? "Type @ to mention a team member."
                    : undefined
                }
                required
              >
                {actions.teamMembers.length > 0 ? (
                  <MentionTextarea
                    id="action-description"
                    name="actionDescription"
                    value={actions.newAction.actionDescription}
                    onChange={actions.setActionDescription}
                    members={actions.teamMembers}
                    placeholder="Describe the action performed in detail..."
                    rows={4}
                  />
                ) : (
                  <Textarea
                    id="action-description"
                    name="actionDescription"
                    value={actions.newAction.actionDescription}
                    onChange={actions.handleInputChange}
                    placeholder="Describe the action performed in detail..."
                    rows={4}
                  />
                )}
              </Field>

              <Field label="Action type" htmlFor="action-type">
                <Select
                  id="action-type"
                  name="actionType"
                  value={actions.newAction.actionType}
                  onChange={actions.handleInputChange}
                >
                  <option value="COMMENT">COMMENT</option>
                </Select>
              </Field>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={actions.closeModal}
                disabled={actions.saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  actions.saving ||
                  !actions.newAction.actionName ||
                  !actions.newAction.actionDescription
                }
              >
                {actions.saving ? <Spinner size={14} label="Saving action" /> : null}
                Save Action
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
