import express from "express";
import {
  createReservation,
  getAllReservations,
  getReservationById,
  deleteReservation,
} from "../controllers/reservationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReservation);
router.get("/", protect, getAllReservations);
router.get("/:id", protect, getReservationById);
router.delete("/:id", protect, deleteReservation);

export default router;
