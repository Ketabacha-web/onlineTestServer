// const multer = require("multer");
import multer from "multer";
import { getFormattedDate } from "./formatedDate.component.js";

export function fileUploader(destination, audio) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Specify the destination folder where uploaded files will be stored
      // cb(null, destination);

      if (file.mimetype.startsWith("image/")) {
        cb(null, destination);
      } else if (file.mimetype.startsWith("audio/")) {
        cb(null, audio);
      } else {
        cb(new Error("Invalid file type"));
      }
    },
    filename: function (req, file, cb) {
      // Get the file extension
      // const ext = file.originalname.split(".").pop();

      // Generate a new filename with the date appended to the end
      // const newFilename = file.originalname.replace(
      //   `.${ext}`,
      //   `_${Date.now()}.${ext}`
      // );

      const newFilename = `${Date.now()}_${file.originalname}`;
      cb(null, newFilename);
    },
  });

  const upload = multer({ storage: storage });

  return upload;
}

// module.exports = fileUploader;

// USE THIS COMPONENT LIKE THIS:

// const express = require("express");
// const router = express.Router();
// const fileUploader = require("./path/to/fileUploader-component");

// const upload = fileUploader("uploads/");

// router.post("/upload", upload.single("file"), function (req, res) {
//   // Handle the uploaded file
// });

// router.get("/download", function (req, res) {
//   // Handle the download request
// });

// router.put("/update", upload.single("file"), function (req, res) {
//   // Handle the uploaded file and update request
// });

// router.delete("/delete", function (req, res) {
//   // Handle the delete request
// });

// module.exports = router;
