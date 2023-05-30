import { createServer } from "http";
// import { Log } from "./components/log.js";
import { app } from "./express.js";
import * as dotenv from "dotenv";
import { Log } from "./components/logger.component.js";
dotenv.config();

// CREATING NODEJS SERVER
const server = createServer(app);
// -----------------------

// FETCHING PORT VALUE FROM ENVIRONMENT VARIABLES .env FILE IN THE SERVER
const PORT = process.env.PORT||10000;
// -----------------------

// STARTING SERVER IN SPECIFIC PORT
server.listen(PORT, () => {
  Log.info("server is lived on the network !!!");
  Log.info(`server is running on port: ${PORT}`);
});
// -----------------------
