import React from "react";
import { Badge, ListGroup } from "react-bootstrap";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

const HistoryTab = ({ history }) => {
  const { displayedItems: paginatedHistory, LoadMoreSpinner } = useInfiniteScroll(history);

  if (history.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <p>No assignment history yet</p>
      </div>
    );
  }

  return (
    <>
      <ListGroup variant="flush">
        {paginatedHistory.map((h) => (
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
                    <span className="me-1">Assigned to</span>
                  )}
                  <Badge bg="primary" className="me-1">
                    {h.toUsername}
                  </Badge>
                  <span className="text-muted">
                    by {h.changedByUsername}
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
