import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import Axios from "axios";

export const CreateNewTask = () => {
  const [show, setShow] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setTaskName("");
    setTaskDescription("");
  };

  const handleTaskNameChange = (e) => setTaskName(e.target.value);
  const handleTaskDescriptionChange = (e) => setTaskDescription(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await Axios.get("http://localhost:3001/api/tasks");
      const existingTasks = response.data;

      const sortField = existingTasks.length > 0 ? existingTasks.length + 1 : 1;

      await Axios.post("http://localhost:3001/api/tasks", {
        name: taskName,
        description: taskDescription,
        sort_field: sortField,
      });

      console.log("Task created successfully:", response.data);

      handleClose();
    } catch (error) {
      console.error("Error creating task:", error.message);
    }
  };

  return (
    <>
      <Button className="btn btn-primary mx-auto d-block" onClick={handleShow}>
        Create New Task
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="taskName">
              <Form.Label>Task Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter task name"
                value={taskName}
                onChange={handleTaskNameChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="taskDescription">
              <Form.Label>Task Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter task description"
                value={taskDescription}
                onChange={handleTaskDescriptionChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Create
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};
