import express from "express";
import validateTextMiddleware from "../components/middlewares/validations/validateText.middleware.js";
import db from "../config/mySql.db.connection.config.js";

// CREATING EXPRESS ROUTER
export const template = express.Router();

// HTML METHODS
// GET
template.post(
  "/",
  validateTextMiddleware(3, 50, true, "name"),
  (req, res) => {
    res.status(200).json({ message: "login route" });
  }
);
// -----------------------

// GET all users
template.get("/", async (req, res) => {
  try {
    const users = await db("users").select("*");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET user by ID
template.get("/:id", async (req, res) => {
  try {
    const user = await db("users")
      .select("*")
      .where({ id: req.params.id })
      .first();
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST a new user
template.post("/", async (req, res) => {
  const { name, email, age } = req.body;
  if (!name || !email || !age)
    return res.status(400).json({ msg: "Please include name, email, and age" });

  try {
    const newUser = await db("users").insert({ name, email, age });
    res.json(newUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// PUT update user by ID
template.put("/:id", async (req, res) => {
  const { name, email, age } = req.body;
  if (!name && !email && !age)
    return res
      .status(400)
      .json({ msg: "Please include at least one field to update" });

  try {
    const updatedUser = await db("users")
      .where({ id: req.params.id })
      .update({ name, email, age });
    if (!updatedUser) return res.status(404).json({ msg: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// DELETE user by ID
template.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await db("users").where({ id: req.params.id }).del();
    if (!deletedUser) return res.status(404).json({ msg: "User not found" });
    res.json(deletedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
