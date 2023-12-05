import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "react-bootstrap";
import Card from "react-bootstrap/Card";
export function SortableTask(props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="m-3">
        <Card.Header>
          {props.task.name} - Display Order: {props.task.sort_field}
        </Card.Header>
        <Card.Body>
          {" "}
          <Button
            variant="secondary"
            onClick={() => {
              props.handleViewDetails(props.task);
            }}
          >
            View Details
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}
