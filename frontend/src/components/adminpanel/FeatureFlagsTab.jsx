import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Form,
  Badge,
  Spinner,
} from "react-bootstrap";
import adminService from "../../services/adminService";
import { successToast, errorToast } from "../common/Noty";

// The known sidebar features
const KNOWN_FEATURES = [
  { key: "tasks", label: "My Tasks", icon: "bi-list-task" },
  { key: "calendar", label: "Calendar", icon: "bi-calendar-date" },
  { key: "lists", label: "Lists", icon: "bi-card-checklist" },
  { key: "teams", label: "Teams", icon: "bi-people" },
];

const FeatureFlagsTab = () => {
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(true);

  const loadFeatures = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getFeatureFlags();
      setFeatures(data);
    } catch (error) {
      errorToast("Error loading feature flags");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const handleToggleFeature = async (featureName, currentValue) => {
    try {
      const updated = await adminService.updateFeatureFlag(
        featureName,
        !currentValue
      );
      setFeatures(updated);
      successToast(`"${featureName}" ${!currentValue ? "enabled" : "disabled"}`);
    } catch (error) {
      errorToast("Error updating feature flag");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white">
        <h5 className="mb-0">
          <i className="bi bi-toggles me-2"></i>Feature Flags
        </h5>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-3">
          Enable or disable application sections for all users. Disabled features
          will be hidden from the sidebar. Changes take effect when users reload.
        </p>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {KNOWN_FEATURES.map((feat) => {
              const enabled = features[feat.key] !== false;
              return (
                <tr key={feat.key}>
                  <td className="fw-semibold">
                    <i className={`bi ${feat.icon} me-2`}></i>
                    {feat.label}
                  </td>
                  <td>
                    <Badge bg={enabled ? "success" : "secondary"}>
                      {enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </td>
                  <td>
                    <Form.Check
                      type="switch"
                      checked={enabled}
                      onChange={() => handleToggleFeature(feat.key, enabled)}
                      label=""
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default FeatureFlagsTab;
