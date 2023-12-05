const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const { router: taskRoute, tasksArray } = require("./routes/taskRoute")(io);
const { router: commentRoute, commentsArray } =
  require("./routes/commentRoute")(io);

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  socket.emit("tasks", tasksArray);
  socket.emit("comments", commentsArray);
});

app.use("/api/", taskRoute);
app.use("/api/", commentRoute);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
