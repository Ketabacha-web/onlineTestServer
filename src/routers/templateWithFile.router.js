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
const templateWithFile = express.Router();

// HTML METHODS
// -----------------------

// GET
templateWithFile.get("/products", async (req, res) => {
  try {
    // const photos = await db("cover_photos").select("file_name");
    const photos = await db("product2").select("*");
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

// GET BY TYPE ID
templateWithFile.get("/type/:id", async (req, res) => {
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
templateWithFile.get("/brand/:id", async (req, res) => {
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploadedImages/products");
  },
  filename: (req, file, cb) => {
    const fileName = `${getFormattedDate()}_${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

templateWithFile.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // console.log(req.body);
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

    const image_name = `${getFormattedDate()}_${req.file.originalname}`;

    // INSERT IN APPLICATION
    const [application_id] = await db("application").insert({});
    // Insert application records into `applications` table
    for (const application of JSON.parse(applications)) {
      application.title.value !== "" &&
        (await db("application_detail").insert({
          ref_id: application_id,
          name: application.title.value,
        }));
    }

    // Insert product record into `products` table
    const [product_id] = await db("product2").insert({
      category_id: Number(JSON.parse(name).value),
      image_name,
      length: JSON.parse(lenght).value,
      width: JSON.parse(width).value,
      height: JSON.parse(height).value,
      for_use_1: [useFor1 ? Number(JSON.parse(useFor1).value) : null],
      for_use_2: [useFor2 ? Number(JSON.parse(useFor2).value) : null],
      for_use_3: [useFor3 ? Number(JSON.parse(useFor3).value) : null],
      for_use_4: [useFor4 ? Number(JSON.parse(useFor4).value) : null],
      application_id,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.code });
  }
});

// -----------------------
// UPDATE
templateWithFile.put("/update/:id", upload.single("file"), async (req, res) => {
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
    const photo = await db("product2").where("id", req.params.id).first();

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const filePath = `src/uploadedImages/products/${photo.image_name}`;
    fs.unlinkSync(filePath);

    const image_name = `${getFormattedDate()}_${req.file.originalname}`;
    fs.renameSync(req.file.path, `src/uploadedImages/products/${image_name}`);
    // ----------

    // INSERT IN APPLICATION
    await db("application")
      .where({ id: photo.application_id })
      .update({ review: null });

    await db("application_detail")
      .where({ ref_id: photo.application_id })
      .del();
    // Insert application records into `applications` table
    for (const application of JSON.parse(applications)) {
      application.title.value !== "" &&
        (await db("application_detail").insert({
          ref_id: photo.application_id,
          name: application.title.value,
        }));
    }

    // Update product record in `products` table
    await db("product2")
      .where({ id: req.params.id })
      .update({
        category_id: Number(JSON.parse(name).value),
        image_name,
        length: JSON.parse(lenght).value,
        width: JSON.parse(width).value,
        height: JSON.parse(height).value,
        for_use_1: [useFor1 ? Number(JSON.parse(useFor1).value) : null],
        for_use_2: [useFor2 ? Number(JSON.parse(useFor2).value) : null],
        for_use_3: [useFor3 ? Number(JSON.parse(useFor3).value) : null],
        for_use_4: [useFor4 ? Number(JSON.parse(useFor4).value) : null],
        // application_id,
      });

    // Delete existing application records in `applications` table
    // await db("applications").where({ product_id: req.params.id }).del();
    // // Insert application records into `applications` table
    // for (const application of JSON.parse(applications)) {
    //   application.title.value !== "" &&
    //     (await db("applications").insert({
    //       product_id: req.params.id,
    //       title: application.title.value,
    //     }));
    // }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.code });
  }
});
// -----------------------

// DELETE
templateWithFile.delete("/products/:id", async (req, res) => {
  try {
    const photo = await db("product2").where("id", req.params.id).first();

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const filePath = `src/uploadedImages/products/${photo.image_name}`;
    fs.unlinkSync(filePath);
    // await db("products").where("id", req.params.id).delete();

    // -----
    const product = await db("product2").where({ id: req.params.id }).first();
    // Delete product record from `products` table
    await db("product2").where({ id: req.params.id }).del();

    // Delete corresponding application records from `applications` table
    await db("application").where({ id: product.application_id }).del();
    await db("application_detail")
      .where({ ref_id: product.application_id })
      .del();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = {
  templateWithFile,
};
