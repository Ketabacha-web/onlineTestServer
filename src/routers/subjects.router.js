import express from "express";
import validateTextMiddleware from "../components/middlewares/validations/validateText.middleware.js";
import { db } from "../config/mySql.db.connection.config.js";

// CREATING EXPRESS ROUTER
export const subjects = express.Router();

// HTML METHODS
// GET
// subjects.post("/", validateTextMiddleware(3, 50, true, "name"), (req, res) => {
//   res.status(200).json({ message: "login route" });
// });
// -----------------------

// GET all users
subjects.get("/", async (req, res) => {
  try {
    const subjects = await db("subjects").select("*");
    res.json(subjects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET user by ID
subjects.get("/:id", async (req, res) => {
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

// POST a new subject
subjects.post(
  "/",
  validateTextMiddleware(1, 100, true, "name"),
  async (req, res) => {
    const { name, system } = req.body;

    try {
      const newSubject = await db("subjects").insert({
        subject: name,
        system_id: system,
      });
      res.json(newSubject);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: err.code });
    }
  }
);

// PUT update user by ID
subjects.put(
  "/:id",
  validateTextMiddleware(1, 100, true, "name"),
  async (req, res) => {
    const { name, system } = req.body;

    try {
      const updateSubject = await db("subjects")
        .where({ id: req.params.id })
        .update({
          subject: name,
          system_id: system,
        });
      if (!updateSubject)
        return res.status(404).json({ message: "Subject not found" });
      res.json(updateSubject);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: err.code });
    }
  }
);

// DELETE user by ID
subjects.delete("/:id", async (req, res) => {
  try {
    const deletedSubject = await db("subjects")
      .where({ id: req.params.id })
      .del();
    if (!deletedSubject)
      return res.status(404).json({ msg: "Subject not found" });
    res.json(deletedSubject);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.code });
  }
});
