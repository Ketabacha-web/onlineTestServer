import express from "express";
// const bcrypt = require("bcrypt");
import bcrypt from "bcrypt";
// const jwt = require("jsonwebtoken");
import jwt from "jsonwebtoken";
// const crypto = require("crypto");
import crypto from "crypto";
// const nodemailer = require("nodemailer");
import nodemailer from "nodemailer";
import validateTextMiddleware from "../components/middlewares/validations/validateText.middleware.js";
import { db } from "../config/mySql.db.connection.config.js";
import validateEmailMiddleware from "../components/middlewares/validations/validateEmail.middleware.js";
import validatePasswordMiddleware from "../components/middlewares/validations/validatePassword.middleware.js";
import verifyToken from "../components/middlewares/verifyToken.middleware.js";

// CREATING EXPRESS ROUTER
export const userRouter = express.Router();

// GET all users
userRouter.get("/", async (req, res) => {
  try {
    const users = await db("users").select("*");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Endpoint to handle user registration requests
userRouter.post(
  "/register",
  // verifyToken,
  validateTextMiddleware(1, 50, true, "name"),
  validateTextMiddleware(1, 50, true, "lastname"),
  validateEmailMiddleware(true, "email"),
  validatePasswordMiddleware("password"),
  async (req, res) => {
    const { name, lastname, email, password } = req.body;

    try {
      // Check if user with the given email already exists
      const userExists = await db("users").where({ email }).first();
      if (userExists) {
        return res
          .status(409)
          .json({ message: "User with this email already exists" });
      }

      // Hash and salt the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const verificationToken = crypto.randomBytes(20).toString("hex");

      // Insert new user into the database
      const [userId] = await db("users").insert({
        name,
        lastname,
        email,
        password: hashedPassword,
        verification_token: verificationToken,
      });

      // Send a verification email to the user's email address
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          // user: process.env.GMAIL_USER,
          user: "medullah.academy@gmail.com",
          // pass: process.env.GMAIL_PASSWORD,
          pass: "aegfttbzssvhricl",
        },
      });
      const verificationUrl = `http://162.254.33.206:10000/user/verify-email?token=${verificationToken}`;
      const mailOptions = {
        // from: process.env.GMAIL_USER,
        from: "medullah.academy@gmail.com",
        to: email,
        subject: "Verify your email address",
        html: `<p>Please click the following link to verify your email address:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
      };

      const verificationUrl2 = `http://162.254.33.206:10000/user/active-email?token=${verificationToken}`;
      const mailOptions2 = {
        // from: process.env.GMAIL_USER,
        from: "medullah.academy@gmail.com",
        to: "medullah.academy@gmail.com",
        subject: "Active your client email address",
        html: `<p>Please click the following link to active your client email address:</p><p><a href="${verificationUrl2}">${verificationUrl2}</a></p>`,
      };
      await transporter.sendMail(mailOptions);
      await transporter.sendMail(mailOptions2);

      res.json({
        id: userId,
        message:
          "User registered successfully. Please check your email to verify your account.",
      });

      // res.json({ id: userId, message: "User registered successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred during registration" });
    }
  }
);

// Email verification endpoint
userRouter.get("/verify-email", async (req, res) => {
  const token = req.query.token;
  const user = await db("users").where({ verification_token: token }).first();
  if (!user) {
    return res.status(400).json({ error: "Invalid verification token" });
  }
  await db("users")
    .where({ id: user.id })
    .update({ verified_at: new Date(), is_verified: true });
  // res.json({ message: "Email address verified successfully" });
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div style="background-color: whitesmoke; height: 50vh;display: flex;justify-content: center;align-items: center;flex-direction: column;text-transform: capitalize;font-weight: bold;color: green;"><div>Your Email address verified successfully</div></br><div>Thank you!</div> </div>
</body>
</html>`);
});

// Active user endpoint
userRouter.get("/active-email", async (req, res) => {
  const token = req.query.token;
  const user = await db("users").where({ verification_token: token }).first();
  if (!user) {
    return res.status(400).json({ error: "Invalid verification token" });
  }

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);

  await db("users").where({ id: user.id }).update({
    actived_at: new Date(),
    is_actived: true,
    expire_at: expirationDate,
  });
  // res.json({ message: "Email address verified successfully" });
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div style="background-color: whitesmoke; height: 50vh;display: flex;justify-content: center;align-items: center;flex-direction: column;text-transform: capitalize;font-weight: bold;color: green;"><div>Your Client Email address Has Been Activated successfully</div></br><div>Thank you!</div> </div>
</body>
</html>`);
});

userRouter.get("/check-expiration", async (req, res) => {
  const currentDate = new Date();

  const expiredUsers = await db("users")
    .where("expire_at", "<", currentDate)
    .andWhere("is_actived", true);

  if (expiredUsers.length === 0) {
    return res.json({ message: "No expired users found" });
  }

  const expiredUserIds = expiredUsers.map((user) => user.id);

  await db("users").whereIn("id", expiredUserIds).update({ is_actived: false });

  res.json({ message: "Expired users have been updated" });
});

// ------------

userRouter.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { id } = jwt.verify(
      req.headers.authorization.split(" ")[1],
      "secret-key"
    );
    const user = await knex("users").select("password").where({ id }).first();
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await knex("users").update({ password: hashedPassword }).where({ id });
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Active user endpoint update
userRouter.put("/active-email/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { id, is_actived } = req.body;
    // console.log(req.body);

    const user = await db("users").where({ id: userId }).first();
    if (!user) {
      return res.status(400).json({ error: "NO USER FOUND!" });
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    await db("users").where({ id: user.id }).update({
      actived_at: new Date(),
      is_actived,
      expire_at: expirationDate,
    });
    // res.json({ message: "Email address verified successfully" });
    res.json({ message: "user activity changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});
// ----------------

// const crypto = require("crypto");

userRouter.post("/forgot-password", verifyToken, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db("users").where({ email }).first();
    if (!user) {
      throw new Error("User not found");
    }
    const token = crypto.randomBytes(20).toString("hex");
    const expires_at = new Date();
    expires_at.setMinutes(expires_at.getMinutes() + 30); // Token expires in 30 minutes
    await db("password_resets").insert({
      email,
      token,
      expires_at,
      // created_at: new Date(),
    });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        // user: process.env.GMAIL_USER,
        user: "medullah.academy@gmail.com",
        // pass: process.env.GMAIL_PASSWORD,
        pass: "aegfttbzssvhricl",
      },
    });
    const mailOptions = {
      // from: "noreply@yourapp.com",
      from: "medullah.academy@gmail.com",
      to: email,
      subject: "Password Reset",
      text: `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\nPlease click on the following link or paste this into your browser to complete the process:\n\nhttp://medulla.academy/login/reset-password/${token}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.code });
  }
});

// ---------------

userRouter.post("/reset-password", verifyToken, async (req, res) => {
  try {
    const { token, password } = req.body;
    const resetRecord = await db("password_resets")
      .where({ token })
      .where("expires_at", ">", new Date())
      .orderBy("created_at", "desc")
      .first();
    if (!resetRecord) {
      // throw new Error("Invalid token");
      await db("password_resets").where({ token }).delete();
      throw new Error("Reset token has been expired or Invalid");
    }
    const { email } = resetRecord;
    const hashedPassword = await bcrypt.hash(password, 10);
    await db("users").where({ email }).update({ password: hashedPassword });
    await db("password_resets").where({ token }).delete();
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});
