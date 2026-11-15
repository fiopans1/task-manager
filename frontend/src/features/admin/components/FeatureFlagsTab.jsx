import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ListChecks, ListTodo, Users } from "@/shared/lib/icons";
import adminService from "@/services/adminService";
import { errorToast, promiseToast } from "@/shared/feedback/Noty";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/shared/ui/panel";
import { Switch } from "@/shared/ui/switch";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

const KNOWN_FEATURES = [
  { key: "tasks", label: "My Tasks", icon: ListTodo },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "lists", label: "Lists", icon: ListChecks },
  { key: "teams", label: "Teams", icon: Users },
];

export default function FeatureFlagsTab() {
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(true);

  const loadFeatures = useCallback(async () => {
    setLoading(true);
    try {
      setFeatures(await adminService.getFeatureFlags());
    } catch {
      errorToast("Error loading feature flags");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const handleToggleFeature = async (featureName, currentValue) => {
    const willEnable = !currentValue;
    try {
      const updated = await promiseToast(
        adminService.updateFeatureFlag(featureName, willEnable),
        {
          loading: `${willEnable ? "Enabling" : "Disabling"} ${featureName}...`,
          success: `"${featureName}" ${willEnable ? "enabled" : "disabled"}`,
          error: () => "Error updating feature flag",
        },
      );
      setFeatures(updated);
    } catch {
      errorToast("Error updating feature flag");
    }
  };

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Feature Flags</PanelTitle>
        <span className="text-xs text-muted-foreground">
          Changes take effect when users reload.
        </span>
      </PanelHeader>
      <PanelContent className="p-0">
        <p className="border-b border-border px-5 py-3 text-xs leading-5 text-muted-foreground">
          Enable or disable application sections for all users. Disabled features
          are hidden from the sidebar.
        </p>

        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {KNOWN_FEATURES.map((feature) => {
                const enabled = features[feature.key] !== false;
                const IconComponent = feature.icon;

                return (
                  <TableRow key={feature.key}>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        <IconComponent size={15} aria-hidden="true" />
                        {feature.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge tone={enabled ? "success" : "neutral"}>
                        {enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={enabled}
                        onChange={() => handleToggleFeature(feature.key, enabled)}
                        aria-label={`Toggle ${feature.label}`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </PanelContent>
    </Panel>
  );
}
