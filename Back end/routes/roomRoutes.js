import express from "express";
import {
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  createRoom,
} from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllRooms);
router.get("/:id", protect, getRoomById);
router.post("/", protect, createRoom);
router.put("/:id", protect, updateRoom);
router.delete("/:id", protect, deleteRoom);

export default router;
