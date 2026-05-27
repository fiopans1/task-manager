import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import TaskDetailsTask from "./TaskDetailsTask";
import TaskDetailsActions from "./TaskDetailsActions";
import taskService from "../../../services/taskService";

const TaskDetails = () => {
  const params = useParams();
  const [teamId, setTeamId] = useState(null);

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
      <TaskDetailsActions taskId={params.id} teamId={teamId} />
    </Container>
  );
};

export default TaskDetails;
