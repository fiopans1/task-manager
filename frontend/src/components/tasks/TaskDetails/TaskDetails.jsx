import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import TaskDetailsTask from "./TaskDetailsTask";
import TaskDetailsActions from "./TaskDetailsActions";
import TaskTimeTracker from "./TaskTimeTracker";
import taskService from "../../../services/taskService";

const TaskDetails = () => {
  const params = useParams();
  const [teamId, setTeamId] = useState(null);
  const [actionsRefreshKey, setActionsRefreshKey] = useState(0);

  useEffect(() => {
    if (params.id) {
      taskService.getTaskById(params.id).then((task) => {
        if (task.teamId) {
          setTeamId(task.teamId);
        }
      }).catch(() => {});
    }
  }, [params.id]);

  return (
    <Container fluid className="p-0">
      <TaskDetailsTask taskId={params.id} />
      <TaskTimeTracker
        taskId={params.id}
        onTimerChange={() => setActionsRefreshKey((key) => key + 1)}
      />
      <TaskDetailsActions
        taskId={params.id}
        teamId={teamId}
        externalRefreshKey={actionsRefreshKey}
      />
    </Container>
  );
};

export default TaskDetails;
