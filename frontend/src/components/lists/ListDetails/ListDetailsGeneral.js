import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import ListDetails from "./ListDetails";
const ListDetailsGeneral = () => {
  const params = useParams();
  return (
    <Container
      fluid
      className="overflow-auto m-2 p-0"
      style={{ height: "100vh" }}
    >
      <ListDetails listId={params.id} />
    </Container>
  );
};

export default ListDetailsGeneral;
