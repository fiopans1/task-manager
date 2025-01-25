import React from "react";
import { useParams } from "react-router-dom";

const TaskDetails = () => {
  const params = useParams();
  return (
    <div>
      <h1>Task number: {params.id}</h1>
    </div>
  );
};

export default TaskDetails;
