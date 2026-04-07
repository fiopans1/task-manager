import React, { useState } from "react";
import { Container, Tab, Tabs } from "react-bootstrap";
import UserManagementTab from "./UserManagementTab";
import FeatureFlagsTab from "./FeatureFlagsTab";
import SystemMessageTab from "./SystemMessageTab";
import { useTranslation } from 'react-i18next';

const AdminPanel = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("users");

  return (
    <Container
      fluid
      className="p-0"
      style={{ height: "100%", overflow: "auto" }}
    >
      <div className="p-3 p-md-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="fw-bold">
            <i className="bi bi-shield-lock me-2"></i>
            {t('admin.title')}
          </h2>
          <p className="text-muted mb-0">
            {t('admin.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
          <Tab
            eventKey="users"
            title={
              <span>
                <i className="bi bi-people me-1"></i>
                <span className="d-none d-sm-inline">{t('admin.usersTab')}</span>
              </span>
            }
          >
            <div className="mt-3">
              <UserManagementTab />
            </div>
          </Tab>
          <Tab
            eventKey="features"
            title={
              <span>
                <i className="bi bi-toggles me-1"></i>
                <span className="d-none d-sm-inline">{t('admin.featuresTab')}</span>
              </span>
            }
          >
            <div className="mt-3">
              <FeatureFlagsTab />
            </div>
          </Tab>
          <Tab
            eventKey="message"
            title={
              <span>
                <i className="bi bi-megaphone me-1"></i>
                <span className="d-none d-sm-inline">{t('admin.systemMessageTab')}</span>
              </span>
            }
          >
            <div className="mt-3">
              <SystemMessageTab />
            </div>
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
};

export default AdminPanel;
