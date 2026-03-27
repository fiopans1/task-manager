import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import TaskDetailsTask from "./TaskDetailsTask";
import TaskDetailsActions from "./TaskDetailsActions";
const TaskDetails = () => {
  const params = useParams();
  return (
    <Container fluid className="p-0">
      <TaskDetailsTask taskId={params.id} />
      <TaskDetailsActions taskId={params.id} />
    </Container>
  );
};

export default TaskDetails;
