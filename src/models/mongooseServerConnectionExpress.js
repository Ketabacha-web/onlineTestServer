import express from "express";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import { Log } from "./components/log.js";
import { adminModel } from "./models/admin.model.js";
import { adminRouter } from "./routers/admin.router.js";

// CREATING EXPRESS SERVER
export const app = express();
// -----------------------

// PACKAGES MIDDLEWARES
app.use(helmet());
app.use(cors());
app.use(express.json());
// -----------------------

// CREATE CONNECTION WITH MONGO_DB
// NOTE: if the localhost had not connected to your database then try to change it to the ip_address
// 127.0.0.1 this will work fine.
const dbName = "server-template-db";
try {
  await mongoose.connect(`mongodb://localhost:27017/${dbName}`);
  Log(`server connected with ${dbName} database successfully`);
} catch (error) {
  Log("database not connected! check the log file or express.js file!");
  throw new Error(
    "server can not connect to the database check express.js file in server!".toUpperCase()
  );
}
// -----------------------

// ALL ROUTES ARE HANDELED HERE AS MIDDLEWARE
app.use("/login", adminRouter);
// -----------------------

// THE ROOT ROUTE OF THE SERVER
app.get("/", async (req, res) => {
  adminModel.find({}, function (err, docs) {
    res.send(docs);
  });
});
// -----------------------
