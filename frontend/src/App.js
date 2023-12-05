import { CreateNewTask } from "./components/CreateNewTask";
import { TaskList } from "./components/TaskList";

export default function App() {
  return (
    <div>
      <br />
      <CreateNewTask />
      <br />
      <TaskList />
    </div>
  );
}
