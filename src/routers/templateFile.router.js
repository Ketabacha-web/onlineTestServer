// import express from "express";
// import multer from "multer";
// import db from "../config/mySql.db.connection.config.js";
// import fs from "fs";
// import getFormattedDate from "../config/formatedDate.config.js";

const express = require("express");
const multer = require("multer");
const db = require("../config/mySql.db.connection.config.js");
const fs = require("fs");
const getFormattedDate = require("../config/formatedDate.config.js");

// CREATING EXPRESS ROUTER
const templateFile = express.Router();

// HTML METHODS
// -----------------------

// GET
templateFile.get("/covers", async (req, res) => {
  try {
    // const photos = await db("cover_photos").select("file_name");
    const photos = await db("cover_photos").select("*");
    // console.log(photos);
    const imageDataPromises = photos.map(async (photo) => {
      const filePath = `src/uploadedImages/coverPhoto/${photo.file_name}`;
      const imageData = fs.readFileSync(filePath);
      const base64Image = imageData.toString("base64");
      return { imageData: base64Image, ...photo };
    });

    const imageData = await Promise.all(imageDataPromises);

    res.json({ photos: imageData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// -----------------------

// POST
// const date = Date.now();
// let now = new Date();
// const date = getFormattedDate(now);
// console.log(getFormattedDate());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploadedImages/coverPhoto");
  },
  filename: (req, file, cb) => {
    // const date = new Date().toISOString().slice(0, 10);
    // const date = Date.now();
    const fileName = `${getFormattedDate()}_${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

templateFile.post("/upload", upload.single("file"), async (req, res) => {
  try {
    //   const { name } = req.body;
    // const fileName = `${new Date().toISOString().slice(0, 10)}_${
    //   req.file.originalname
    // }`;
    const fileName = `${getFormattedDate()}_${req.file.originalname}`;

    await db("cover_photos").insert({ file_name: fileName });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.code });
  }
});

// -----------------------

// DELETE
templateFile.delete("/covers/:id", async (req, res) => {
  try {
    const photo = await db("cover_photos").where("id", req.params.id).first();

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const filePath = `src/uploadedImages/coverPhoto/${photo.file_name}`;
    fs.unlinkSync(filePath);
    await db("cover_photos").where("id", req.params.id).delete();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = {
  templateFile,
};
