import express from "express";
import validateTextMiddleware from "../components/middlewares/validations/validateText.middleware.js";
import { db } from "../config/mySql.db.connection.config.js";
import fs from "fs";

// CREATING EXPRESS ROUTER
export const createTestRouter = express.Router();

// HTML METHODS
// GET
// createTestRouter.post("/", validateTextMiddleware(3, 50, true, "name"), (req, res) => {
//   res.status(200).json({ message: "login route" });
// });
// -----------------------

// GET all counted question based on options
createTestRouter.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  // console.log(userId);
  const queryBuilder = db("questions")
    .leftJoin("exam_history", function () {
      this.on("questions.id", "=", "exam_history.question_id").andOn(
        "exam_history.user_id",
        "=",
        db.raw("?", [userId])
      );
    })
    .select(db.raw("COUNT(DISTINCT questions.id) AS total"))
    .select(
      db.raw(
        "COUNT(DISTINCT CASE WHEN exam_history.id IS NULL THEN questions.id END) AS unused"
      )
    )
    .select(
      db.raw(
        "COUNT(DISTINCT CASE WHEN exam_history.user_answer = 1 AND exam_history.is_answer_correct = 0 THEN questions.id END) AS incorrect"
      )
    )
    .select(
      db.raw(
        "COUNT(DISTINCT CASE WHEN exam_history.user_answer = 1 AND exam_history.is_answer_correct = 1 THEN questions.id END) AS marked"
      )
    )
    .select(db.raw("COUNT(DISTINCT questions.id) AS total_count"))
    .then((result) => {
      const counts = {
        unused: result[0].unused || 0,
        incorrect: result[0].incorrect || 0,
        marked: result[0].marked || 0,
        all: result[0].total || 0,
      };

      res.json(counts);
    })
    .catch((error) => {
      console.error(error.message);
      res.status(500).json({ message: "Server Error" });
    });
});

// GET user by ID
createTestRouter.get("/:id", async (req, res) => {
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

// POST a new test
createTestRouter.post("/", async (req, res) => {
  const { timed, questionMode, subjects, systems, NOQ, userId } = req.body;
  // console.log(req.body);

  try {
    const createTestId = await db("create_tests").insert({ user_id: userId });
    subjects.forEach(async (subject) => {
      const createTestSubjectId = await db("create_test_subjects").insert({
        create_test_id: createTestId,
        subject_id: parseInt(subject),
        user_id: userId,
      });
    });
    systems.forEach(async (system) => {
      const createTestSystemId = await db("create_test_systems").insert({
        create_test_id: createTestId,
        system_id: parseInt(system),
        user_id: userId,
      });
    });
    const testId = await db("test").insert({
      timed,
      question_mode: questionMode,
      noq: NOQ,
      create_test_id: createTestId,
      user_id: userId,
    });

    // res.json(newUser);

    // res.json({ success: true });

    // GET AND SEND FILTRED QUESTIONS HERE
    let queryBuilder = db("questions");

    if (questionMode === "unused") {
      queryBuilder = queryBuilder
        .leftJoin("exam_history", function () {
          this.on("questions.id", "=", "exam_history.question_id").andOn(
            "exam_history.user_id",
            "=",
            userId
          );
        })
        .whereNull("exam_history.id");
    } else if (questionMode === "incorrect") {
      queryBuilder = queryBuilder
        .join("exam_history", function () {
          this.on("questions.id", "=", "exam_history.question_id").andOn(
            "exam_history.user_id",
            "=",
            userId
          );
        })
        // .join("options", "questions.id", "=", "options.question_id")
        .join("options AS o", "questions.id", "=", "o.question_id")
        // .where("options.is_correct", 0)
        .where("o.is_correct", 0)
        .where("exam_history.user_answer", true)
        // .where("exam_history.isAnswerCorrect", false);
        .where("exam_history.is_answer_correct", false);
    } else if (questionMode === "marked") {
      queryBuilder = queryBuilder
        .join("exam_history", function () {
          this.on("questions.id", "=", "exam_history.question_id").andOn(
            "exam_history.user_id",
            "=",
            userId
          );
        })
        // .join("options", "questions.id", "=", "options.question_id")
        .join("options AS o", "questions.id", "=", "o.question_id")
        // .where("options.is_correct", 1)
        .where("o.is_correct", 1)
        .where("exam_history.user_answer", true)
        // .where("exam_history.isAnswerCorrect", true);
        .where("exam_history.is_answer_correct", true);
    }

    if (subjects && subjects.length > 0) {
      queryBuilder = queryBuilder.whereIn("questions.subject", subjects);
    }

    if (systems && systems.length > 0) {
      queryBuilder = queryBuilder.whereIn("questions.system", systems);
    }

    try {
      const rows = await queryBuilder
        .select("questions.*", "options.*")
        .leftJoin("options", "questions.id", "=", "options.question_id")
        .limit(40); // Assuming NOQ refers to the number of questions to retrieve

      const questions = [];
      const questionIds = new Set();

      rows.forEach((row) => {
        const questionId = row.question_id;

        if (!questionIds.has(questionId)) {
          questionIds.add(questionId);

          const question = {
            id: row.question_id,
            testId: createTestId[0],
            question_text: row.question_text,
            // question_audio: row.question_audio,
            // question_image: row.question_image,
            question_score: row.question_score,
            subject: row.subject,
            system: row.system,
            created_at: row.created_at,
            updated_at: row.updated_at,
            options: [],
          };

          if (row.question_audio) {
            const filePath2 = row.question_audio;
            const audioData = fs.readFileSync(filePath2);
            const base64Audio = audioData.toString("base64");
            question.question_audio = base64Audio;
          } else {
            question.question_audio = null;
          }

          if (row.question_image) {
            const filePath2 = row.question_image;
            const imageData = fs.readFileSync(filePath2);
            const base64Image = imageData.toString("base64");
            question.question_image = base64Image;
          } else {
            question.question_image = null;
          }

          questions.push(question);
        }

        const option = {
          id: row.id,
          option_text: row.option_text,
          // option_audio: row.option_audio,
          // option_image: row.option_image,
          is_correct: row.is_correct,
          question_id: row.question_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
        };

        if (row.option_audio) {
          const filePath2 = row.option_audio;
          const audioData = fs.readFileSync(filePath2);
          const base64Audio = audioData.toString("base64");
          option.option_audio = base64Audio;
        } else {
          option.option_audio = null;
        }

        if (row.option_image) {
          const filePath2 = row.option_image;
          const imageData = fs.readFileSync(filePath2);
          const base64Image = imageData.toString("base64");
          option.option_image = base64Image;
        } else {
          option.option_image = null;
        }

        const question = questions.find((q) => q.id === questionId);
        question.options.push(option);
        // console.log(option);
      });

      // GET THE OPTIONS PERCENTAGES
      const optionPercentagesMap = new Map();

      for (const question of questions) {
        const questionId = question.id;

        const optionSelectionCounts = await db
          .select("o.option_text")
          .count("* as selection_count")
          .from("options as o")
          .join("exam_history as e", function () {
            this.on("e.question_id", "=", "o.question_id").andOn(
              "e.user_answer",
              "=",
              "o.option_text"
            );
          })
          .where("e.question_id", questionId)
          .groupBy("o.option_text");

        for (const row of optionSelectionCounts) {
          const optionText = row.option_text;
          const selectionCount = row.selection_count;

          const option = question.options.find(
            (option) => option.option_text === optionText
          );

          if (option) {
            option.selection_count = selectionCount;
          }
        }

        const totalSubmissions = optionSelectionCounts.reduce(
          (total, row) => total + row.selection_count,
          0
        );

        for (const option of question.options) {
          const selectionCount = option.selection_count || 0;
          const percentageSelected =
            (selectionCount / totalSubmissions) * 100 || 0;
          option.percentage_selected = percentageSelected;
        }

        // Calculate the percentage of the correct answer for the question
        const correctOption = question.options.find(
          (option) => option.is_correct
        );
        const correctOptionCount = correctOption.selection_count || 0;
        question.correct_answer_percentage =
          (correctOptionCount / totalSubmissions) * 100 || 0;
      }
      // ---------------------------

      console.log(questions);
      res.json(questions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST a new question bank test
createTestRouter.post("/questionBankTest", async (req, res) => {
  const { userId } = req.body;

  try {
    const createTestId = await db("create_tests").insert({ user_id: userId });

    const numQuestions = 40; // Assuming NOQ refers to the number of questions to retrieve

    const questions = await db
      .select("q.*", "options.*")
      .from(function () {
        this.select("questions.*")
          .from("questions")
          .orderByRaw("RAND()")
          .limit(numQuestions)
          .as("q");
      })
      .leftJoin("options", "q.id", "=", "options.question_id");

    const formattedQuestions = [];
    const questionIds = new Set();

    questions.forEach((row) => {
      const questionId = row.question_id;

      if (!questionIds.has(questionId)) {
        questionIds.add(questionId);

        const question = {
          id: row.question_id,
          testId: createTestId[0],
          question_text: row.question_text,
          question_score: row.question_score,
          subject: row.subject,
          system: row.system,
          created_at: row.created_at,
          updated_at: row.updated_at,
          options: [],
        };

        if (row.question_audio) {
          const filePath2 = row.question_audio;
          const audioData = fs.readFileSync(filePath2);
          const base64Audio = audioData.toString("base64");
          question.question_audio = base64Audio;
        } else {
          question.question_audio = null;
        }

        if (row.question_image) {
          const filePath2 = row.question_image;
          const imageData = fs.readFileSync(filePath2);
          const base64Image = imageData.toString("base64");
          question.question_image = base64Image;
        } else {
          question.question_image = null;
        }

        formattedQuestions.push(question);
      }

      const option = {
        id: row.id,
        option_text: row.option_text,
        is_correct: row.is_correct,
        question_id: row.question_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };

      if (row.option_audio) {
        const filePath2 = row.option_audio;
        const audioData = fs.readFileSync(filePath2);
        const base64Audio = audioData.toString("base64");
        option.option_audio = base64Audio;
      } else {
        option.option_audio = null;
      }

      if (row.option_image) {
        const filePath2 = row.option_image;
        const imageData = fs.readFileSync(filePath2);
        const base64Image = imageData.toString("base64");
        option.option_image = base64Image;
      } else {
        option.option_image = null;
      }

      const question = formattedQuestions.find((q) => q.id === questionId);
      question.options.push(option);
    });

    // GET THE OPTIONS PERCENTAGES
    const optionPercentagesMap = new Map();

    for (const question of formattedQuestions) {
      const questionId = question.id;

      const optionSelectionCounts = await db
        .select("o.option_text")
        .count("* as selection_count")
        .from("options as o")
        .join("exam_history as e", function () {
          this.on("e.question_id", "=", "o.question_id").andOn(
            "e.user_answer",
            "=",
            "o.option_text"
          );
        })
        .where("e.question_id", questionId)
        .groupBy("o.option_text");

      for (const row of optionSelectionCounts) {
        const optionText = row.option_text;
        const selectionCount = row.selection_count;

        const option = question.options.find(
          (option) => option.option_text === optionText
        );

        if (option) {
          option.selection_count = selectionCount;
        }
      }

      const totalSubmissions = optionSelectionCounts.reduce(
        (total, row) => total + row.selection_count,
        0
      );

      for (const option of question.options) {
        const selectionCount = option.selection_count || 0;
        const percentageSelected =
          (selectionCount / totalSubmissions) * 100 || 0;
        option.percentage_selected = percentageSelected;
      }

      // Calculate the percentage of the correct answer for the question
      const correctOption = question.options.find(
        (option) => option.is_correct
      );
      const correctOptionCount = correctOption.selection_count || 0;
      question.correct_answer_percentage =
        (correctOptionCount / totalSubmissions) * 100 || 0;
    }
    // ---------------------------

    console.log(formattedQuestions);
    res.json(formattedQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// PUT update user by ID
createTestRouter.put("/:id", async (req, res) => {
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
createTestRouter.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await db("users").where({ id: req.params.id }).del();
    if (!deletedUser) return res.status(404).json({ msg: "User not found" });
    res.json(deletedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
