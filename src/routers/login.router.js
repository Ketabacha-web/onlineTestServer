import express from "express";
// const bcrypt = require("bcrypt");
import bcrypt from "bcrypt";
// const jwt = require("jsonwebtoken");
import jwt from "jsonwebtoken";
import validateTextMiddleware from "../components/middlewares/validations/validateText.middleware.js";
import { db } from "../config/mySql.db.connection.config.js";

// CREATING EXPRESS ROUTER
export const loginRouter = express.Router();

// Endpoint to handle user login requests
loginRouter.post("/user", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user with the given email exists
    const user = await db("users").where({ email }).first();
    if (!user) {
      return res.status(404).json({ message: "Invalid Email" });
    }

    // Verify the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(404).json({ message: "Invalid Password" });
    }

    // Create a JWT token with a 1-hour expiration time
    const token = jwt.sign({ userId: user.id }, "your_secret_key", {
      expiresIn: "2d",
    });

    // res
    //   .cookie("token", token, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: "none",
    //   })
    //   .json({ message: "Login successful" });
    // console.log(user);
    res.json({
      message: "Login successful",
      userId: user.id,
      token: token,
      isActivated: user.is_actived,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred during login" });
  }
});
