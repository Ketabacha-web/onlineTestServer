import express from "express";
import validateTextMiddleware from "../components/middlewares/validations/validateText.middleware.js";

// CREATING EXPRESS ROUTER
export const adminRouter = express.Router();

// HTML METHODS
// GET
adminRouter.post(
  "/",
  validateTextMiddleware(3, 50, true, "name"),
  (req, res) => {
    res.status(200).json({ message: "login route" });
  }
);
// -----------------------
