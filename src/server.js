import { createServer } from "http";
// import { Log } from "./components/log.js";
import { app } from "./express.js";
import * as dotenv from "dotenv";
import { Log } from "./components/logger.component.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { db } from "./config/mySql.db.connection.config.js";
dotenv.config();

// CREATING NODEJS SERVER
const server = createServer(app);
// -----------------------

// FETCHING PORT VALUE FROM ENVIRONMENT VARIABLES .env FILE IN THE SERVER
const PORT = process.env.PORT || 10000;
// -----------------------

// STARTING SERVER IN SPECIFIC PORT
server.listen(PORT, async () => {
  Log.info("server is lived on the network !!!");
  Log.info(`server is running on port: ${PORT}`);

  // INSERT ADMIN USER IF NOT EXIST TO THE DATABASE!!!
  try {
    // Check if the admin user exists in the database
    const adminUser = await db("users")
      .where({ email: "test.mail.developer.jsx@gmail.com" })
      .first();

    // If the admin user doesn't exist, insert it into the database
    if (!adminUser) {
      // Hash and salt the password
      const hashedPassword = await bcrypt.hash("Test@1234", 10);

      const verificationToken = crypto.randomBytes(20).toString("hex");

      await db("users").insert({
        name: "admin",
        lastname: "admin",
        email: "test.mail.developer.jsx@gmail.com",
        password: hashedPassword,
        role: "admin",
        verification_token: verificationToken,
        is_verified: 1,
        is_actived: 1,
        // Add other admin user details as needed
      });
      Log.info("Admin user inserted into the database.");
    } else {
      Log.info("Admin user already exists in the database.");
    }

    // Close the database connection
    await db.destroy();
  } catch (error) {
    Log.error("Error occurred while inserting admin user:", error);
  }
});
// -----------------------
