const express = require("express");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const dataFilePath = path.join(__dirname, "../data/comments.json");

const readCommentsFromFile = () => {
  try {
    const data = fs.readFileSync(dataFilePath, "utf-8");

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading comments file:", error);
    return [];
  }
};

const writeCommentsToFile = (comments) => {
  try {
    const data = JSON.stringify(comments, null, 2);
    fs.writeFileSync(dataFilePath, data, "utf-8");
  } catch (error) {
    console.error("Error writing comments file:", error);
  }
};

const configureRoutes = (io) => {
  router.get("/comments", (req, res) => {
    try {
      const comments = readCommentsFromFile();
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.get("/comments/:taskId", (req, res) => {
    try {
      const { taskId } = req.params;
      const comments = readCommentsFromFile();
      const taskComments = comments.filter(
        (comment) => comment.task_id === taskId
      );
      res.status(200).json(taskComments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.post("/comments", (req, res) => {
    try {
      const comments = readCommentsFromFile();

      const newComment = {
        id: uuidv4(),
        ...req.body,
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
      };

      comments.push(newComment);
      writeCommentsToFile(comments);
      io.emit("comments", comments);
      res.status(200).json(newComment);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: error.message });
    }
  });

  router.put("/comments/:id", (req, res) => {
    try {
      const { id } = req.params;
      const comments = readCommentsFromFile();
      const index = comments.findIndex((comment) => comment.id === id);

      if (index === -1) {
        return res.status(404).json({ message: "Cannot find comment with id" });
      }

      comments[index] = {
        ...comments[index],
        ...req.body,
        updated_at: new Date(),
      };

      writeCommentsToFile(comments);
      res.status(200).json(comments[index]);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return { router, commentsArray: readCommentsFromFile() };
};

module.exports = configureRoutes;
