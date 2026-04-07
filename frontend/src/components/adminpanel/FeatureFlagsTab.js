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
import { useTranslation } from 'react-i18next';

// The known sidebar features
const KNOWN_FEATURES = [
  { key: "tasks", labelKey: "sidebar.myTasks", icon: "bi-list-task" },
  { key: "calendar", labelKey: "sidebar.calendar", icon: "bi-calendar-date" },
  { key: "lists", labelKey: "sidebar.lists", icon: "bi-card-checklist" },
  { key: "teams", labelKey: "sidebar.teams", icon: "bi-people" },
];

const FeatureFlagsTab = () => {
  const { t } = useTranslation();
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
          <i className="bi bi-toggles me-2"></i>{t('featureFlags.title')}
        </h5>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-3">
          {t('featureFlags.description')}
        </p>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>{t('featureFlags.feature')}</th>
              <th>{t('featureFlags.status')}</th>
              <th>{t('featureFlags.action')}</th>
            </tr>
          </thead>
          <tbody>
            {KNOWN_FEATURES.map((feat) => {
              const enabled = features[feat.key] !== false;
              return (
                <tr key={feat.key}>
                  <td className="fw-semibold">
                    <i className={`bi ${feat.icon} me-2`}></i>
                    {t(feat.labelKey)}
                  </td>
                  <td>
                    <Badge bg={enabled ? "success" : "secondary"}>
                      {enabled ? t('featureFlags.enabled') : t('featureFlags.disabled')}
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
