import { useParams } from "react-router-dom";
import { Container} from "react-bootstrap";
import TaskDetailsTask from "./TaskDetailsTask";
import TaskDetailsActions from "./TaskDetailsActions";
const TaskDetails = () => {
  const params = useParams();
  return (
      <Container
        fluid
        className="overflow-auto m-2 p-0"
        style={{ height: "100vh" }}
      >
       <TaskDetailsTask taskId={params.id}/>
       <TaskDetailsActions/>

    </Container>
  );
};

export default TaskDetails;
