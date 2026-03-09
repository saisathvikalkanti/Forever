import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  registerController,
  loginController,
  logoutController,
  getMeController,
  changeUserPasswordController,
  forgotPasswordController,
  resetPasswordController
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/logout", protect, logoutController);

router.get("/getMe", protect, getMeController);

router.put("/changePassword", protect, changeUserPasswordController);

router.post("/forgotPassword", forgotPasswordController);

router.post("/resetPassword/:token", resetPasswordController);

export default router;

