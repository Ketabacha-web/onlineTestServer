import { model, Schema } from "mongoose";
import { Log } from "../components/log.js";

// CREATING MONGODB SCHEMA WHEN DATA GOING TO INSERT
const adminSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
  },
  lastModifyAt: {
    type: String,
  },
});
// -----------------------

// CREATING MONGODB MODEL FOR CREATING COLLECTION BASED ON THE SCHEMA
export const adminModel = model("admin", adminSchema);
// -----------------------

// CHECK WEATHER DATABASE HAS ADMIN ACCOUNT OR NOT IF NOT CREATE ONE WITH DEFAULT PASSWORD!
adminModel.find({}, function (err, docs) {
  //   console.log(docs.length);

  const admin = {
    username: "admin",
    password: "db@admin",
    createdAt: `${new Date().toDateString()} - ${new Date().toTimeString()}`,
    lastModifyAt: `${new Date().toDateString()} - ${new Date().toTimeString()}`,
  };
  // console.log(admin.createdAt)

  if (!docs.length) {
    adminModel.create(admin, function (err, admin) {
      if (err) return console.error(err);
      // saved!
      // console.log(admin);
      Log("admin user created for the first time!");
    });
  }
});
// -----------------------
