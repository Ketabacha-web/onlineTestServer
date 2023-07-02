// import express from "express";
// import multer from "multer";
// import db from "../config/mySql.db.connection.config.js";
// import fs from "fs";
// import getFormattedDate from "../config/formatedDate.config.js";

import { fileUploader } from "../components/fileUploader.component.js";
// const getFormattedDate = require("../config/formatedDate.config.js");
import { getFormattedDate } from "../components/formatedDate.component.js";
import { db } from "../config/mySql.db.connection.config.js";
// const express = require("express");
import express, { json } from "express";
// const multer = require("multer");
import multer from "multer";
// const fs = require("fs");
import fs from "fs";
import verifyToken from "../components/middlewares/verifyToken.middleware.js";

// CREATING EXPRESS ROUTER
export const questionsRouter = express.Router();

// HTML METHODS
// -----------------------

// GET
questionsRouter.get("/", async (req, res) => {
  try {
    // const photos = await db("cover_photos").select("file_name");
    const questions = await db("questions").select("*");
    // console.log(photos);
    const imageDataPromises = questions.map(async (question) => {
      const filePath = question.question_image;
      const imageData = filePath && fs.readFileSync(filePath);
      const base64Image = filePath && imageData.toString("base64");

      const filePath2 = question.question_audio;
      const audioData = filePath2 && fs.readFileSync(filePath2);
      const base64Audio = filePath2 && audioData.toString("base64");

      // description
      const filePathDescription = question.question_description_image;
      const imageDataDescription =
        filePathDescription && fs.readFileSync(filePathDescription);
      const base64ImageDescription =
        filePathDescription && imageDataDescription.toString("base64");
      // -----------

      // -------

      const options = await db("options")
        .select("*")
        .where({ question_id: question.id });

      const formattedOptions = options.map((option) => ({
        ...option,
        option_image:
          option.option_image &&
          fs.readFileSync(option.option_image).toString("base64"),
        option_audio:
          option.option_audio &&
          fs.readFileSync(option.option_audio).toString("base64"),
      }));

      // -------

      return {
        options: formattedOptions,
        questionImageData: base64Image,
        questionAudioData: base64Audio,
        questionImageDataDescription: base64ImageDescription,
        ...question,
      };
    });

    const imageData = await Promise.all(imageDataPromises);

    res.json({ questions: imageData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET BY TYPE ID
questionsRouter.get("/type/:id", async (req, res) => {
  try {
    // console.log(req.params.id);
    // const photos = await db("cover_photos").select("file_name");
    const photos = await db("product2").select("*").where({
      category_id: req.params.id,
    });
    // console.log(photos);
    const imageDataPromises = photos.map(async (photo) => {
      const filePath = `src/uploadedImages/products/${photo.image_name}`;
      const imageData = fs.readFileSync(filePath);
      const base64Image = imageData.toString("base64");

      // -------

      const category = await db("category")
        .select("*")
        .where({ id: photo.category_id });

      const forUse1 = await db("brand")
        .select("*")
        .where({ id: photo.for_use_1 });

      const forUse2 = await db("brand")
        .select("*")
        .where({ id: photo.for_use_2 });

      const forUse3 = await db("brand")
        .select("*")
        .where({ id: photo.for_use_3 });

      const forUse4 = await db("brand")
        .select("*")
        .where({ id: photo.for_use_4 });

      const applications = await db("application_detail")
        .select("*")
        .where({ ref_id: photo.application_id });

      // -------

      return {
        category: category[0],
        forUse1: forUse1[0],
        forUse2: forUse2[0],
        forUse3: forUse3[0],
        forUse4: forUse4[0],
        applications,
        ...photo,
        imageData: base64Image,
      };
    });

    const imageData = await Promise.all(imageDataPromises);

    res.json({ product: imageData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET BY BRAND ID
questionsRouter.get("/brand/:id", async (req, res) => {
  try {
    // console.log(req.params.id);
    // const photos = await db("cover_photos").select("file_name");
    const photos = await db("product2")
      .select("*")
      .where({
        for_use_1: req.params.id,
      })
      .orWhere({ for_use_2: req.params.id })
      .orWhere({ for_use_3: req.params.id })
      .orWhere({ for_use_4: req.params.id });
    // console.log(photos);
    const imageDataPromises = photos.map(async (photo) => {
      const filePath = `src/uploadedImages/products/${photo.image_name}`;
      const imageData = fs.readFileSync(filePath);
      const base64Image = imageData.toString("base64");

      // -------

      const category = await db("category")
        .select("*")
        .where({ id: photo.category_id });

      const forUse1 = await db("brand")
        .select("*")
        .where({ id: photo.for_use_1 });

      const forUse2 = await db("brand")
        .select("*")
        .where({ id: photo.for_use_2 });

      const forUse3 = await db("brand")
        .select("*")
        .where({ id: photo.for_use_3 });

      const forUse4 = await db("brand")
        .select("*")
        .where({ id: photo.for_use_4 });

      const applications = await db("application_detail")
        .select("*")
        .where({ ref_id: photo.application_id });

      // -------

      return {
        category: category[0],
        forUse1: forUse1[0],
        forUse2: forUse2[0],
        forUse3: forUse3[0],
        forUse4: forUse4[0],
        applications,
        ...photo,
        imageData: base64Image,
      };
    });

    const imageData = await Promise.all(imageDataPromises);

    res.json({ product: imageData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// -----------------------
// POST

// const uploadFiles = fileUploader("src/uploads/images", "src/uploads/audios");
const uploadFiles = fileUploader("uploads/images", "uploads/audios");

const upload = multer();

questionsRouter.post(
  "/",
  verifyToken,
  uploadFiles.fields([
    { name: "questionAudioFile" },
    { name: "answerOptionAudioFile0" },
    { name: "answerOptionAudioFile1" },
    { name: "answerOptionAudioFile2" },
    { name: "answerOptionAudioFile3" },
    // 4 optional options
    { name: "answerOptionAudioFile4" },
    { name: "answerOptionAudioFile5" },
    { name: "answerOptionAudioFile6" },
    { name: "answerOptionAudioFile7" },

    { name: "questionImageFile" },
    { name: "questionDescriptionImageFile" },
    { name: "answerOptionImageFile0" },
    { name: "answerOptionImageFile1" },
    { name: "answerOptionImageFile2" },
    { name: "answerOptionImageFile3" },
    // 4 optional options
    { name: "answerOptionImageFile4" },
    { name: "answerOptionImageFile5" },
    { name: "answerOptionImageFile6" },
    { name: "answerOptionImageFile7" },
  ]),

  async (req, res) => {
    try {
      // console.log(JSON.parse(req.body.questionText));
      // console.log(JSON.parse(req.body.isCorrectAnswer0));
      // console.log(req.body);
      // console.log(req.files);

      const {
        name,
        lenght,
        width,
        height,
        applications,
        useFor1,
        useFor2,
        useFor3,
        useFor4,
      } = req.body;

      // const image_name = `${getFormattedDate()}_${req.file.originalname}`;

      const questionID = req.body.questionID;
      const question_text = JSON.parse(req.body.questionText).value;
      const question_audio = req.files.questionAudioFile
        ? req.files.questionAudioFile[0].path
        : null;
      const question_image = req.files.questionImageFile
        ? req.files.questionImageFile[0].path
        : null;
      // question description
      const question_description_text = JSON.parse(
        req.body.questionDescription
      ).value;

      const question_description_image = req.files.questionDescriptionImageFile
        ? req.files.questionDescriptionImageFile[0].path
        : null;
      // --------------------
      const question_score = JSON.parse(req.body.questionScore).value;
      const subject = JSON.parse(req.body.subject).value;
      const system = JSON.parse(req.body.system).value;

      // handle the form data here, e.g. save to a database

      // Creating the current date sql yoq not support timestamp 2 times
      const currentDate = new Date();

      // Getting the components of the current date
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 to month since it's zero-based
      const day = String(currentDate.getDate()).padStart(2, "0");

      // Formatting the date in "YYYY-MM-DD" format
      const formattedDate = `${year}-${month}-${day}`;

      // INSERT IN APPLICATION
      const [question_id] = await db("questions").insert({
        questionID,
        question_text,
        question_audio,
        question_image,
        question_description_text,
        question_description_image,
        question_score,
        subject,
        system,
        updated_at: formattedDate,
      });

      // Insert application records into `applications` table
      // for (const application of JSON.parse(applications)) {
      //   application.title.value !== "" &&
      //     (await db("application_detail").insert({
      //       ref_id: application_id,
      //       name: application.title.value,
      //     }));
      // }

      const answerOptions = [
        {
          option_text: JSON.parse(req.body.answerOptionText0).value,
          option_audio: req.files.answerOptionAudioFile0
            ? req.files.answerOptionAudioFile0[0].path
            : null,
          option_image: req.files.answerOptionImageFile0
            ? req.files.answerOptionImageFile0[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer0),
          question_id,
        },
        {
          option_text: JSON.parse(req.body.answerOptionText1).value,
          option_audio: req.files.answerOptionAudioFile1
            ? req.files.answerOptionAudioFile1[0].path
            : null,
          option_image: req.files.answerOptionImageFile1
            ? req.files.answerOptionImageFile1[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer1),
          question_id,
        },
        {
          option_text: JSON.parse(req.body.answerOptionText2).value,
          option_audio: req.files.answerOptionAudioFile2
            ? req.files.answerOptionAudioFile2[0].path
            : null,
          option_image: req.files.answerOptionImageFile2
            ? req.files.answerOptionImageFile2[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer2),
          question_id,
        },
        {
          option_text: JSON.parse(req.body.answerOptionText3).value,
          option_audio: req.files.answerOptionAudioFile3
            ? req.files.answerOptionAudioFile3[0].path
            : null,
          option_image: req.files.answerOptionImageFile3
            ? req.files.answerOptionImageFile3[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer3),
          question_id,
        },
        // 4 optional options
        {
          option_text: JSON.parse(req.body.answerOptionText4).value,
          option_audio: req.files.answerOptionAudioFile4
            ? req.files.answerOptionAudioFile4[0].path
            : null,
          option_image: req.files.answerOptionImageFile4
            ? req.files.answerOptionImageFile4[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer4),
          question_id,
        },
        {
          option_text: JSON.parse(req.body.answerOptionText5).value,
          option_audio: req.files.answerOptionAudioFile5
            ? req.files.answerOptionAudioFile5[0].path
            : null,
          option_image: req.files.answerOptionImageFile5
            ? req.files.answerOptionImageFile5[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer5),
          question_id,
        },
        {
          option_text: JSON.parse(req.body.answerOptionText6).value,
          option_audio: req.files.answerOptionAudioFile6
            ? req.files.answerOptionAudioFile6[0].path
            : null,
          option_image: req.files.answerOptionImageFile6
            ? req.files.answerOptionImageFile6[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer6),
          question_id,
        },
        {
          option_text: JSON.parse(req.body.answerOptionText7).value,
          option_audio: req.files.answerOptionAudioFile7
            ? req.files.answerOptionAudioFile7[0].path
            : null,
          option_image: req.files.answerOptionImageFile7
            ? req.files.answerOptionImageFile7[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer7),
          question_id,
        },
      ];

      // Insert product record into `products` table
      answerOptions.forEach(async (option) => {
        const [product_id] = await db("options").insert(option);
      });

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error", message: err.code });
    }
  }
);

// -----------------------
// UPDATE
questionsRouter.put(
  "/:id",
  verifyToken,
  uploadFiles.fields([
    { name: "questionAudioFile" },
    { name: "answerOptionAudioFile0" },
    { name: "answerOptionAudioFile1" },
    { name: "answerOptionAudioFile2" },
    { name: "answerOptionAudioFile3" },
    // 4 optional options
    { name: "answerOptionAudioFile4" },
    { name: "answerOptionAudioFile5" },
    { name: "answerOptionAudioFile6" },
    { name: "answerOptionAudioFile7" },

    { name: "questionImageFile" },
    { name: "questionDescriptionImageFile" },
    { name: "answerOptionImageFile0" },
    { name: "answerOptionImageFile1" },
    { name: "answerOptionImageFile2" },
    { name: "answerOptionImageFile3" },
    // 4 optional options
    { name: "answerOptionImageFile4" },
    { name: "answerOptionImageFile5" },
    { name: "answerOptionImageFile6" },
    { name: "answerOptionImageFile7" },
  ]),
  async (req, res) => {
    // console.log(JSON.parse(req.body.isCorrectAnswer1));
    // console.log(JSON.parse(JSON.parse(req.body.isCorrectAnswer2)));
    // console.log(req.body);
    // console.log(req.files);
    try {
      const {
        name,
        lenght,
        width,
        height,
        applications,
        useFor1,
        useFor2,
        useFor3,
        useFor4,
      } = req.body;

      // ----------

      // GET DATA FROM REQUEST
      const question_text = JSON.parse(req.body.questionText).value;
      const question_audio = req.files.questionAudioFile
        ? req.files.questionAudioFile[0].path
        : null;
      const question_image = req.files.questionImageFile
        ? req.files.questionImageFile[0].path
        : null;
      // question description
      const question_description_text = JSON.parse(
        req.body.questionDescription
      ).value;

      const question_description_image = req.files.questionDescriptionImageFile
        ? req.files.questionDescriptionImageFile[0].path
        : null;
      // --------------------
      const question_score = JSON.parse(req.body.questionScore).value;
      const subject = JSON.parse(req.body.subject).value;
      const system = JSON.parse(req.body.system).value;

      // GET THE PREVIOUS DATA
      const question = await db("questions").where("id", req.params.id).first();

      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }

      const filePathImage = question_image && question.question_image;
      if (filePathImage) {
        question_image && fs.unlinkSync(filePathImage);
      }

      const filePathAudio = question_audio && question.question_audio;
      if (filePathAudio) {
        question_audio && fs.unlinkSync(filePathAudio);
      }

      // question description
      const filePathDescriptionImage =
        question_description_image && question.question_description_image;
      if (filePathDescriptionImage) {
        question_description_image && fs.unlinkSync(filePathDescriptionImage);
      }
      // --------------------

      // const image_name = `${getFormattedDate()}_${req.file.originalname}`;
      // fs.renameSync(req.file.path, `src/uploadedImages/products/${image_name}`);
      // ----------

      // Update question record in `qustions` table
      // Creating the current date sql yoq not support timestamp 2 times
      const currentDate = new Date();

      // Getting the components of the current date
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 to month since it's zero-based
      const day = String(currentDate.getDate()).padStart(2, "0");

      // Formatting the date in "YYYY-MM-DD" format
      const formattedDate = `${year}-${month}-${day}`;

      const updateObject = {
        question_text,
        question_description_text,
        question_score,
        subject,
        system,
        updated_at: formattedDate,
      };

      if (question_audio !== null) {
        updateObject.question_audio = question_audio;
      }

      if (question_image !== null) {
        updateObject.question_image = question_image;
      }
      // question description
      if (question_description_image !== null) {
        updateObject.question_description_image = question_description_image;
      }
      // ====================
      await db("questions").where({ id: req.params.id }).update(updateObject);

      // UPDATE ANSWERS OPTIONS TABLE
      const answerOptions = [
        {
          id: JSON.parse(req.body.answerId0),
          option_text: JSON.parse(req.body.answerOptionText0).value,
          option_audio: req.files.answerOptionAudioFile0
            ? req.files.answerOptionAudioFile0[0].path
            : null,
          option_image: req.files.answerOptionImageFile0
            ? req.files.answerOptionImageFile0[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer0),
          question_id: req.params.id,
        },
        {
          id: JSON.parse(req.body.answerId1),
          option_text: JSON.parse(req.body.answerOptionText1).value,
          option_audio: req.files.answerOptionAudioFile1
            ? req.files.answerOptionAudioFile1[0].path
            : null,
          option_image: req.files.answerOptionImageFile1
            ? req.files.answerOptionImageFile1[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer1),
          question_id: req.params.id,
        },
        {
          id: JSON.parse(req.body.answerId2),
          option_text: JSON.parse(req.body.answerOptionText2).value,
          option_audio: req.files.answerOptionAudioFile2
            ? req.files.answerOptionAudioFile2[0].path
            : null,
          option_image: req.files.answerOptionImageFile2
            ? req.files.answerOptionImageFile2[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer2),
          question_id: req.params.id,
        },
        {
          id: JSON.parse(req.body.answerId3),
          option_text: JSON.parse(req.body.answerOptionText3).value,
          option_audio: req.files.answerOptionAudioFile3
            ? req.files.answerOptionAudioFile3[0].path
            : null,
          option_image: req.files.answerOptionImageFile3
            ? req.files.answerOptionImageFile3[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer3),
          question_id: req.params.id,
        },
        // 4 optional options
        {
          id: JSON.parse(req.body.answerId4),
          option_text: JSON.parse(req.body.answerOptionText4).value,
          option_audio: req.files.answerOptionAudioFile4
            ? req.files.answerOptionAudioFile4[0].path
            : null,
          option_image: req.files.answerOptionImageFile4
            ? req.files.answerOptionImageFile4[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer4),
          question_id: req.params.id,
        },
        {
          id: JSON.parse(req.body.answerId5),
          option_text: JSON.parse(req.body.answerOptionText5).value,
          option_audio: req.files.answerOptionAudioFile5
            ? req.files.answerOptionAudioFile5[0].path
            : null,
          option_image: req.files.answerOptionImageFile5
            ? req.files.answerOptionImageFile5[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer5),
          question_id: req.params.id,
        },
        {
          id: JSON.parse(req.body.answerId6),
          option_text: JSON.parse(req.body.answerOptionText6).value,
          option_audio: req.files.answerOptionAudioFile6
            ? req.files.answerOptionAudioFile6[0].path
            : null,
          option_image: req.files.answerOptionImageFile6
            ? req.files.answerOptionImageFile6[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer6),
          question_id: req.params.id,
        },
        {
          id: JSON.parse(req.body.answerId7),
          option_text: JSON.parse(req.body.answerOptionText7).value,
          option_audio: req.files.answerOptionAudioFile7
            ? req.files.answerOptionAudioFile7[0].path
            : null,
          option_image: req.files.answerOptionImageFile7
            ? req.files.answerOptionImageFile7[0].path
            : null,
          is_correct: JSON.parse(req.body.isCorrectAnswer7),
          question_id: req.params.id,
        },
      ];

      // Retrieve existing options from the database for the specific question
      const options = await db("options")
        .select("*")
        .where({ question_id: req.params.id });

      for (const option of options) {
        const existingOption = answerOptions.find((o) => o.id === option.id);

        if (existingOption) {
          // Delete existing files if they have changed
          if (existingOption.option_image && option.option_image) {
            fs.unlinkSync(option.option_image);
          }

          if (existingOption.option_audio && option.option_audio) {
            fs.unlinkSync(option.option_audio);
          }
        } else {
          // Delete existing files if the option has been removed
          if (option.option_image) {
            fs.unlinkSync(option.option_image);
          }

          if (option.option_audio) {
            fs.unlinkSync(option.option_audio);
          }
        }
      }

      // console.log(answerOptions);
      for (const option of answerOptions) {
        const updateObject = {
          option_text: option.option_text,
          is_correct: option.is_correct,
          question_id: option.question_id,
        };

        if (option.option_audio !== null) {
          updateObject.option_audio = option.option_audio;
        }

        if (option.option_image !== null) {
          updateObject.option_image = option.option_image;
        }

        await db("options").where({ id: option.id }).update(updateObject);
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error", message: err.code });
    }
  }
);
// -----------------------

// DELETE
questionsRouter.delete("/:id", async (req, res) => {
  try {
    const question = await db("questions").where("id", req.params.id).first();
    const options = await db("options")
      .select("*")
      .where({ question_id: question.id });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    if (!options) {
      return res.status(404).json({ error: "Options not found" });
    }

    const filePath = question.question_image && question.question_image;
    question.question_image && fs.unlinkSync(filePath);

    const filePath2 = question.question_audio && question.question_audio;
    question.question_audio && fs.unlinkSync(filePath2);
    // description
    const filePathDescription =
      question.question_description_image &&
      question.question_description_image;
    question.question_description_image && fs.unlinkSync(filePathDescription);
    // -----------
    // ----
    options?.forEach((option) => {
      const filePath = option.option_image && option.option_image;
      option.option_image && fs.unlinkSync(filePath);

      const filePath2 = option.option_audio && option.option_audio;
      option.option_audio && fs.unlinkSync(filePath2);
    });

    // -----
    // Delete product record from `products` table
    await db("questions").where({ id: req.params.id }).del();

    // Delete corresponding application records from `applications` table
    await db("options").where({ question_id: question.id }).del();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// module.exports = {
//   questionsRouter,
// };
