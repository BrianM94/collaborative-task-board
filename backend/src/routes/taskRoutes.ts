import { Router } from "express";
import { authenticateJWT } from "../middlewares/authMiddleware";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  moveTask,
  reorderTasks,
} from "../controllers/taskController";

const router = Router();

router.use(authenticateJWT);

router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/move", moveTask);
router.post("/reorder", reorderTasks);

export default router;
