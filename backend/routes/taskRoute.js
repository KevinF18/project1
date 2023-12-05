const express = require("express");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const dataFilePath = path.join(__dirname, "../data/tasks.json");

const readTasksFromFile = () => {
  try {
    const data = fs.readFileSync(dataFilePath, "utf-8");

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading tasks file:", error);
    return [];
  }
};

const writeTasksToFile = (tasks) => {
  try {
    const data = JSON.stringify(tasks, null, 2);
    fs.writeFileSync(dataFilePath, data, "utf-8");
  } catch (error) {
    console.error("Error writing tasks file:", error);
  }
};

const configureRoutes = (io) => {
  router.get("/tasks", (req, res) => {
    try {
      const tasks = readTasksFromFile();
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.get("/tasks/:id", (req, res) => {
    try {
      const { id } = req.params;
      const tasks = readTasksFromFile();
      const task = tasks.find((t) => t.id === id);
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.post("/tasks", (req, res) => {
    try {
      const tasks = readTasksFromFile();

      const newTask = {
        id: uuidv4(),
        ...req.body,
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
      };

      tasks.push(newTask);
      writeTasksToFile(tasks);
      io.emit("tasks", tasks);
      res.status(200).json(newTask);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: error.message });
    }
  });

  router.put("/tasks/reorder", (req, res) => {
    try {
      const { taskOrder } = req.body;
      let tasks = readTasksFromFile();

      const reorderedTasks = taskOrder.map((taskId, index) => {
        const task = tasks.find((t) => t.id === taskId);
        return {
          ...task,
          sort_field: index + 1,
        };
      });

      writeTasksToFile(reorderedTasks);

      io.emit("tasks", reorderedTasks);

      res.status(200).json({ message: "Task order updated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.put("/tasks/:id", (req, res) => {
    try {
      const { id } = req.params;
      const tasks = readTasksFromFile();
      const index = tasks.findIndex((task) => task.id === id);

      if (index === -1) {
        return res.status(404).json({ message: "Cannot find task with id" });
      }

      if (req.body.sort_field !== undefined) {
        tasks[index].sort_field = req.body.sort_field;
        tasks[index].updated_at = new Date();
      }

      tasks[index] = {
        ...tasks[index],
        ...req.body,
        updated_at: new Date(),
      };

      writeTasksToFile(tasks);
      res.status(200).json(tasks[index]);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return { router, tasksArray: readTasksFromFile() };
};

module.exports = configureRoutes;
