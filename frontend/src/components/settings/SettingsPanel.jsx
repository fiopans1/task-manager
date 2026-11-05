import React, { useState } from "react";
import { Container, Tab, Tabs } from "react-bootstrap";
import ProfileTab from "./ProfileTab";

const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Container
      fluid
      className="p-0"
      style={{ height: "100%", overflow: "auto" }}
    >
      <div className="p-3 p-md-4">
        <div className="mb-4">
          <h2 className="fw-bold">
            <i className="bi bi-gear me-2"></i>
            Settings
          </h2>
          <p className="text-muted mb-0">
            Manage your profile and account security
          </p>
        </div>

        <Tabs
          activeKey={activeTab}
          onSelect={(key) => setActiveTab(key || "profile")}
          className="mb-4"
        >
          <Tab
            eventKey="profile"
            title={
              <span>
                <i className="bi bi-person me-1"></i>
                <span className="d-none d-sm-inline">Profile</span>
              </span>
            }
          >
            <div className="mt-3">
              <ProfileTab />
            </div>
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
};

export default SettingsPanel;
