import express from "express";
import validateTextMiddleware from "../components/middlewares/validations/validateText.middleware.js";
import { db } from "../config/mySql.db.connection.config.js";

// CREATING EXPRESS ROUTER
export const examHistoryRouter = express.Router();

// HTML METHODS
// GET
// examHistoryRouter.post("/", validateTextMiddleware(3, 50, true, "name"), (req, res) => {
//   res.status(200).json({ message: "login route" });
// });
// -----------------------

// GET user by ID
examHistoryRouter.get("/user/:user_id", async (req, res) => {
  // console.log(req.params.user_id);
  try {
    const examsHistory = await db("exam_history")
      .select("*")
      .where({ user_id: req.params.user_id });
    // .first();
    // if (!user) return res.status(404).json({ msg: "User not found" });
    const createTest = await db("create_tests")
      .select("*")
      .where({ user_id: req.params.user_id });

    if (examsHistory.length === 0) return res.json([]);

    res.json(createTest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET user by ID
examHistoryRouter.get("/user/:user_id/:test_id", async (req, res) => {
  // console.log(req.params.user_id);
  try {
    const examsHistory = await db("exam_history")
      .select("*")
      .where({ user_id: req.params.user_id, test_id: req.params.test_id });
    // .first();
    // if (!user) return res.status(404).json({ msg: "User not found" });
    const correctCount = examsHistory.filter(
      (exam) => exam.is_answer_correct === 1
    ).length;
    const incorrectCount = examsHistory.filter(
      (exam) => exam.is_answer_correct === 0
    ).length;

    const totalQuestions = examsHistory.length;
    const correctPercentage = (correctCount / totalQuestions) * 100;
    const incorrectPercentage = (incorrectCount / totalQuestions) * 100;

    const history = await Promise.all(
      examsHistory.map(async (exam, index) => {
        const questions = await db("questions")
          .select("*")
          .where({ id: exam.question_id });

        const systems = await db("systems")
          .select("*")
          .where({ id: questions[0].system });
        const subjects = await db("subjects")
          .select("*")
          .where({ id: questions[0].subject });

        return {
          id: index,
          test: exam,
          question: questions[0],
          system: systems[0],
          subject: subjects[0],
          correctCount,
          incorrectCount,
          correctPercentage,
          incorrectPercentage,
        };
      })
    );

    if (examsHistory.length === 0) return res.json([]);

    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST a new user
examHistoryRouter.post("/", async (req, res) => {
  const {
    test_id,
    user_id,
    question_id,
    submition_time,
    user_answer,
    is_answer_correct,
    subject_id,
    system_id,
    percentage,
  } = req.body;
  //   if (!name || !email || !age)
  //     return res.status(400).json({ msg: "Please include name, email, and age" });

  try {
    const newExamHistory = await db("exam_history").insert({
      test_id,
      user_id,
      question_id,
      submition_time,
      user_answer,
      is_answer_correct,
      subject_id,
      system_id,
      percentage,
    });
    res.json(newExamHistory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// PUT update user by ID
examHistoryRouter.put("/:id", async (req, res) => {
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
examHistoryRouter.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await db("users").where({ id: req.params.id }).del();
    if (!deletedUser) return res.status(404).json({ msg: "User not found" });
    res.json(deletedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
