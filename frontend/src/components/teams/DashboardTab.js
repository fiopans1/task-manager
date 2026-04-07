import React from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  ProgressBar,
  ListGroup,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

const DashboardTab = ({ dashboard, team, isAdmin, maxPending, onRoleChange, onRemoveMember }) => {
  const { t } = useTranslation();
  return (
    <>
      {dashboard && (
        <>
          {/* Stats */}
          <Row className="g-3 mb-4">
            {[
              { label: t('dashboardTab.totalTasks'), value: dashboard.totalTasks, bg: "primary" },
              { label: t('dashboardTab.completed'), value: dashboard.completedTasks, bg: "success" },
              { label: t('dashboardTab.inProgress'), value: dashboard.inProgressTasks, bg: "warning" },
              { label: t('dashboardTab.pending'), value: dashboard.pendingTasks, bg: "info" },
            ].map((stat, i) => (
              <Col key={i} xs={6} md={3}>
                <Card className="text-center border rounded-3">
                  <Card.Body className="py-3">
                    <h3 className="fw-bold mb-0">{stat.value}</h3>
                    <small className="text-muted">{stat.label}</small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Completion Progress */}
          {dashboard.totalTasks > 0 && (
            <Card className="border rounded-3 mb-4">
              <Card.Body className="py-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="fw-semibold text-muted">{t('dashboardTab.teamProgress')}</small>
                  <Badge bg={dashboard.completedTasks === dashboard.totalTasks ? "success" : "primary"} pill>
                    {Math.round((dashboard.completedTasks / dashboard.totalTasks) * 100)}%
                  </Badge>
                </div>
                <ProgressBar
                  now={(dashboard.completedTasks / dashboard.totalTasks) * 100}
                  variant={dashboard.completedTasks === dashboard.totalTasks ? "success" : "primary"}
                  style={{ height: 8 }}
                  className="rounded-pill"
                />
              </Card.Body>
            </Card>
          )}

          {/* Team Workload */}
          <h5 className="fw-semibold mb-3">
            <i className="bi bi-bar-chart me-2"></i>{t('dashboardTab.teamWorkload')}
          </h5>
          <Row className="g-3 mb-4">
            {dashboard.members.map((member) => (
              <Col key={member.id} xs={12} md={6} lg={4}>
                <Card className="border rounded-3 h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-2 overflow-hidden">
                      <i className="bi bi-person-circle fs-4 me-2 text-muted flex-shrink-0"></i>
                      <div className="text-truncate">
                        <strong className="text-truncate d-inline-block" style={{ maxWidth: "100%" }}>{member.username}</strong>
                        <Badge
                          bg={member.role === "ADMIN" ? "warning" : "secondary"}
                          className="ms-2"
                          pill
                        >
                          {member.role === "ADMIN" ? t('dashboardTab.admin') : t('dashboardTab.member')}
                        </Badge>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-muted">{t('dashboardTab.pendingTasks')}</small>
                        <small className="fw-semibold">{member.pendingTasks}</small>
                      </div>
                      <ProgressBar
                        now={maxPending > 0 ? (member.pendingTasks / maxPending) * 100 : 0}
                        variant={
                          member.pendingTasks / maxPending > 0.8
                            ? "danger"
                            : member.pendingTasks / maxPending > 0.5
                            ? "warning"
                            : "success"
                        }
                        style={{ height: 6 }}
                        className="rounded-pill"
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Members Management */}
          <h5 className="fw-semibold mb-3">
            <i className="bi bi-people me-2"></i>{t('dashboardTab.members')}
          </h5>
          <MembersList
            members={team.members || []}
            isAdmin={isAdmin}
            onRoleChange={onRoleChange}
            onRemoveMember={onRemoveMember}
          />
        </>
      )}
    </>
  );
};

const MembersList = ({ members, isAdmin, onRoleChange, onRemoveMember }) => {
  const { t } = useTranslation();
  const { displayedItems: paginatedMembers, LoadMoreSpinner } = useInfiniteScroll(members);

  return (
    <Card className="border rounded-3 mb-4">
      <ListGroup variant="flush">
        {paginatedMembers.map((member) => (
          <ListGroup.Item
            key={member.id}
            className="d-flex align-items-center justify-content-between flex-wrap gap-2"
          >
            <div className="d-flex align-items-center overflow-hidden" style={{ minWidth: 0 }}>
              <i className="bi bi-person-circle me-2 fs-5 text-muted flex-shrink-0"></i>
              <div className="text-truncate">
                <span className="fw-medium">{member.username}</span>
                <small className="text-muted ms-2 d-none d-sm-inline">
                  {member.email}
                </small>
              </div>
              <Badge
                bg={member.role === "ADMIN" ? "warning" : "secondary"}
                className="ms-2 flex-shrink-0"
                pill
              >
                {member.role === "ADMIN" ? t('dashboardTab.admin') : t('dashboardTab.member')}
              </Badge>
            </div>
            {isAdmin && (
              <div className="d-flex gap-1">
                <Button
                  size="sm"
                  variant={member.role === "ADMIN" ? "outline-secondary" : "outline-warning"}
                  onClick={() =>
                    onRoleChange(
                      member.id,
                      member.role === "ADMIN" ? "MEMBER" : "ADMIN"
                    )
                  }
                >
                  {member.role === "ADMIN" ? t('dashboardTab.demote') : t('dashboardTab.promote')}
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => onRemoveMember(member)}
                >
                  <i className="bi bi-x-lg"></i>
                </Button>
              </div>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
      <LoadMoreSpinner />
    </Card>
  );
};

export default DashboardTab;
