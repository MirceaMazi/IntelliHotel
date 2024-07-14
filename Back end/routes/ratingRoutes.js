import express from "express";
import {
  createRating,
  getRatingById,
  getAllRatings,
} from "../controllers/ratingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRating);
router.get("/:id", protect, getRatingById);
router.get("/", protect, getAllRatings);

export default router;
