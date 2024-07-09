import express from "express";
import {
  registerUser,
  loginUser,
  getUser,
  createUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", registerUser);
router.post("/login", loginUser);
router.get("/", protect, getUser);
router.post("/create", protect, createUser);

export default router;
