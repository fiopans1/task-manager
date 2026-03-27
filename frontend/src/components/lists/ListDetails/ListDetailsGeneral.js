import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import ListDetails from "./ListDetails";
const ListDetailsGeneral = () => {
  const params = useParams();
  return (
    <Container fluid className="p-0">
      <ListDetails listId={params.id} />
    </Container>
  );
};

export default ListDetailsGeneral;
