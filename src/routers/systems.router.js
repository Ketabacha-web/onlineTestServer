import express from "express";
import validateTextMiddleware from "../components/middlewares/validations/validateText.middleware.js";
import { db } from "../config/mySql.db.connection.config.js";

// CREATING EXPRESS ROUTER
export const systems = express.Router();

// HTML METHODS
// GET
// systems.post("/", validateTextMiddleware(3, 50, true, "name"), (req, res) => {
//   res.status(200).json({ message: "login route" });
// });
// -----------------------

// GET all users
systems.get("/", async (req, res) => {
  try {
    const users = await db("systems").select("*");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.code });
  }
});

// GET user by ID
systems.get("/:id", async (req, res) => {
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
systems.post(
  "/",
  validateTextMiddleware(1, 100, true, "name"),
  async (req, res) => {
    const { name } = req.body;

    try {
      const newSystem = await db("systems").insert({ system: name });
      res.json(newSystem);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: err.code });
    }
  }
);

// PUT update user by ID
systems.put(
  "/:id",
  validateTextMiddleware(1, 100, true, "name"),
  async (req, res) => {
    const { name } = req.body;

    try {
      const updateSystem = await db("systems")
        .where({ id: req.params.id })
        .update({ system: name });
      if (!updateSystem)
        return res.status(404).json({ message: "System not found" });
      res.json(updateSystem);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: err.code });
    }
  }
);

// DELETE user by ID
systems.delete("/:id", async (req, res) => {
  try {
    const deletedSubject = await db("systems")
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
