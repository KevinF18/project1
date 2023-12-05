import React, { useState, useEffect } from "react";
import { Container, Button, Modal, Form } from "react-bootstrap";
import io from "socket.io-client";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Axios from "axios";
import { SortableTask } from "./SortableTask";

const socket = io("http://localhost:3001/");

export const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    socket.on("tasks", (updatedTasks) => {
      setTasks(updatedTasks);
    });
  }, []);

  const loadComments = async (taskId) => {
    try {
      const response = await Axios.get(
        `http://localhost:3001/api/comments/${taskId}`
      );
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error.message);
    }
  };

  const handleViewDetails = (task) => {
    try {
      setTaskName(task.name);
      setTaskDescription(task.description);

      setSelectedTask(task);
      loadComments(task.id);

      setShowModal(true);
    } catch (error) {
      console.error("Error in handleViewDetails:", error.message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveChanges = async () => {
    try {
      const response = await Axios.put(
        `http://localhost:3001/api/tasks/${selectedTask.id}`,
        {
          name: taskName,
          description: taskDescription,
        }
      );

      const updatedTask = response.data;

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );

      socket.emit("tasks", tasks);

      handleCloseModal();
    } catch (error) {
      console.error("Error updating task:", error.message);
    }
  };

  const handleAddComment = async () => {
    try {
      const response = await Axios.post(`http://localhost:3001/api/comments`, {
        task_comment: newComment,
        task_id: selectedTask.id,
      });

      const addedComment = response.data;

      setComments((prevComments) => [...prevComments, addedComment]);

      socket.emit("taskComments", addedComment);

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error.message);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <Container
        className="p-3 align-items-center text-center"
        style={{ width: "100%" }}
      >
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          {tasks.map((task, index) => (
            <SortableTask
              key={task.id}
              id={task.id}
              index={index}
              task={task}
              handleViewDetails={handleViewDetails}
            />
          ))}
        </SortableContext>
      </Container>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formTask">
              <Form.Label>Task Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter task name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
              <Form.Label>Task Description</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter task description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
            </Form.Group>
            <Button variant="info" onClick={handleSaveChanges}>
              Update
            </Button>
          </Form>
          <h3>Comments</h3>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id}>
                <p>{comment.task_comment}</p>
              </div>
            ))
          ) : (
            <p>No comments available.</p>
          )}
          <Form>
            <Form.Group controlId="formComment">
              <Form.Label>Comment on Task</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter a comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </Form.Group>
            <Button variant="dark" onClick={handleAddComment}>
              Add Comment
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </DndContext>
  );

  async function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      const activeIndex = tasks.findIndex((t) => t.id === active.id);
      const overIndex = tasks.findIndex((t) => t.id === over.id);

      const updatedTasks = arrayMove(tasks, activeIndex, overIndex);

      setTasks(updatedTasks);

      socket.emit("tasks", updatedTasks);

      try {
        const taskOrder = updatedTasks.map((task) => task.id);

        await Axios.put("http://localhost:3001/api/tasks/reorder", {
          taskOrder,
        });
      } catch (error) {
        console.error(
          "Error updating task order on the server:",
          error.message
        );
      }
    }
  }
};
