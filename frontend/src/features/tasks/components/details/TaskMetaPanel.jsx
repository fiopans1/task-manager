import { Link } from "react-router-dom";
import { CalendarDays, Flag, ListChecks, User, Users } from "@/shared/lib/icons";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/shared/ui/panel";
import { MetadataList } from "@/shared/patterns/metadata-list";
import { StatusBadge, PriorityBadge } from "@/shared/ui/status-badge";
import { formatDate } from "@/shared/lib/formatDate";

export function TaskMetaPanel({ task }) {
  const items = [
    {
      label: "Status",
      value: <StatusBadge status={task.state} />,
    },
    {
      label: "Priority",
      value: <PriorityBadge priority={task.priority} />,
      icon: Flag,
    },
    {
      label: "Type",
      value: task.isEvent ? "Event" : "Task",
      icon: CalendarDays,
    },
    {
      label: "Owner",
      value: task.user && task.user !== "<None>" ? task.user : "Unassigned",
      icon: User,
    },
    {
      label: "Created",
      value: <span className="font-mono text-xs">{formatDate(task.creationDate)}</span>,
    },
  ];

  if (task.isEvent) {
    items.push(
      {
        label: "Starts",
        value: <span className="font-mono text-xs">{formatDate(task.startDate)}</span>,
        icon: CalendarDays,
      },
      {
        label: "Ends",
        value: <span className="font-mono text-xs">{formatDate(task.endDate)}</span>,
        icon: CalendarDays,
      },
    );
  }

  if (task.listId) {
    items.push({
      label: "List",
      value: (
        <Link
          to={`/home/lists/${task.listId}`}
          className="text-brand hover:underline"
        >
          {task.listName || `List #${task.listId}`}
        </Link>
      ),
      icon: ListChecks,
    });
  }

  if (task.teamId) {
    items.push({
      label: "Team",
      value: (
        <Link
          to={`/home/teams/${task.teamId}`}
          className="text-brand hover:underline"
        >
          {task.teamName || `Team #${task.teamId}`}
        </Link>
      ),
      icon: Users,
    });
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Details</PanelTitle>
      </PanelHeader>
      <PanelContent>
        <MetadataList items={items} />
      </PanelContent>
    </Panel>
  );
}
