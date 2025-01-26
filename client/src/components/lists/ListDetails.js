import React from "react";
import { useParams } from "react-router-dom";
const ListDetails = () => {
  const params = useParams();
  return (
    <div>
      <h1>ListDetails: {params.id}</h1>
    </div>
  );
};

export default ListDetails;
