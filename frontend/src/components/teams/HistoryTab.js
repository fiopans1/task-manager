import React, { useCallback } from "react";
import { Badge, ListGroup, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useServerInfiniteScroll } from "../../hooks/useInfiniteScroll";
import teamService from "../../services/teamService";

const HistoryTab = ({ teamId, refreshKey }) => {
  const { t } = useTranslation();
  const fetchPage = useCallback(async (page, size) => {
    return teamService.fetchAssignmentHistoryPage(teamId, page, size);
  }, [teamId]);

  const { items: history, initialLoading, LoadMoreSpinner } = useServerInfiniteScroll(
    fetchPage, 50, [teamId, refreshKey]
  );

  if (initialLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" className="me-2" />
        <span className="text-muted">{t('historyTab.loadingHistory')}</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <p>{t('historyTab.noHistory')}</p>
      </div>
    );
  }

  return (
    <>
      <ListGroup variant="flush">
        {history.map((h) => (
          <ListGroup.Item key={h.id} className="border-bottom py-2">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="fw-medium">{h.taskName}</span>
                <br />
                <small className="text-muted">
                  {h.fromUsername ? (
                    <>
                      <Badge bg="outline-secondary" className="border me-1">
                        {h.fromUsername}
                      </Badge>
                      <i className="bi bi-arrow-right mx-1"></i>
                    </>
                  ) : (
                    <span className="me-1">{t('historyTab.assignedTo')}</span>
                  )}
                  <Badge bg="primary" className="me-1">
                    {h.toUsername}
                  </Badge>
                  <span className="text-muted">
                    {t('historyTab.by', { username: h.changedByUsername })}
                  </span>
                </small>
              </div>
              <small className="text-muted">
                {new Date(h.changedDate).toLocaleString()}
              </small>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <LoadMoreSpinner />
    </>
  );
};

export default HistoryTab;
