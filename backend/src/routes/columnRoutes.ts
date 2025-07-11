import { Router } from "express";
import { authenticateJWT } from "../middlewares/authMiddleware";
import {
  createColumn,
  getAllColumns,
  getColumnById,
  updateColumn,
  deleteColumn,
  reorderColumns,
} from "../controllers/columnController";

const router = Router();

router.use(authenticateJWT);

router.post("/", createColumn);
router.get("/", getAllColumns);
router.get("/:id", getColumnById);
router.put("/:id", updateColumn);
router.delete("/:id", deleteColumn);
router.post("/reorder", reorderColumns);

export default router;
