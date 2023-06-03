import knex from "knex";

// const knex = require("knex");

export const db = knex({
  client: "mysql2",
  connection: {
    host: "127.0.0.1",
    port: 3306,
    // user: "root",
    user: "admin",
    // user: "shambfuc_root",
    password: "ICUBE2018",
    // password: "q9]6%j5P$+ji",
    database: "online_exam_db",
    // database: "shambfuc_shamsd",
  },
});

// Test the database connection before exporting the db object
db.raw("SELECT 1")
  .then(() => {
    console.log("Database connection successful.");
  })
  .catch((error) => {
    console.error("Error connecting to database:", error.message);
    process.exit(1);
  });

// module.exports = db;
