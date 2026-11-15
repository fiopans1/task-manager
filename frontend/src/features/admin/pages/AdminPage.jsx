import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Megaphone, SlidersHorizontal, Users } from "@/shared/lib/icons";
import { PageContainer } from "@/shared/patterns/page-container";
import { PageHeader } from "@/shared/patterns/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Panel } from "@/shared/ui/panel";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import UserManagementTab from "@/features/admin/components/UserManagementTab";
import FeatureFlagsTab from "@/features/admin/components/FeatureFlagsTab";
import SystemMessageTab from "@/features/admin/components/SystemMessageTab";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [resetKey, setResetKey] = useState(0);

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageHeader
          meta="System / Administration"
          title="Administration Panel"
          description="Manage users, feature flags and system settings."
        />

        <ErrorBoundary
          resetKeys={[activeTab, resetKey]}
          fallback={
            <Panel>
              <EmptyState
                title="This panel stopped responding"
                description="Reload the panel to keep managing users, features and messages."
                action={
                  <Button
                    variant="outline"
                    onClick={() => setResetKey((key) => key + 1)}
                  >
                    Reload panel
                  </Button>
                }
              />
            </Panel>
          }
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="users">
                <Users size={14} aria-hidden="true" />
                Users
              </TabsTrigger>
              <TabsTrigger value="features">
                <SlidersHorizontal size={14} aria-hidden="true" />
                Features
              </TabsTrigger>
              <TabsTrigger value="message">
                <Megaphone size={14} aria-hidden="true" />
                System Message
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UserManagementTab />
            </TabsContent>
            <TabsContent value="features">
              <FeatureFlagsTab />
            </TabsContent>
            <TabsContent value="message">
              <SystemMessageTab />
            </TabsContent>
          </Tabs>
        </ErrorBoundary>
      </div>
    </PageContainer>
  );
}
