import express from "express";
import helmet from "helmet";
import cors from "cors";
// import { Log } from "./components/log.js";
import { adminRouter } from "./routers/admin.router.js";
import rateLimit from "express-rate-limit";
import { Log } from "./components/logger.component.js";
import errorHandler from "./components/middlewares/errorHandler.middleware.js";
import { userRouter } from "./routers/user.router.js";
import { loginRouter } from "./routers/login.router.js";
import verifyToken from "./components/middlewares/verifyToken.middleware.js";
import { subjects } from "./routers/subjects.router.js";
import { systems } from "./routers/systems.router.js";
import { questionsRouter } from "./routers/questions.router.js";
import { createTestRouter } from "./routers/createTest.router.js";
import { examHistoryRouter } from "./routers/examHistory.router.js";
import { adminLoginRouter } from "./routers/adminLogin.router.js";

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
});

// CREATING EXPRESS SERVER
export const app = express();
// -----------------------

// PACKAGES MIDDLEWARES
app.use(limiter);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(errorHandler);
// -----------------------

// ALL ROUTES ARE HANDELED HERE AS MIDDLEWARE
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/login", loginRouter);
app.use("/adminLogin", adminLoginRouter);
app.use("/subject", subjects);
app.use("/system", systems);
app.use("/question", questionsRouter);
app.use("/createTest", createTestRouter);
app.use("/exam_history", examHistoryRouter);
// -----------------------

// THE ROOT ROUTE OF THE SERVER
app.get("/", (req, res) => {
  // console.clear();
  // Log.info(`Requested from ip: ${req.ip}`);
  // Log.info(`Requested hostname: ${req.hostname}`);
  // Log.info(`Requested to route: ${req.originalUrl}`);
  // Log.info(`Requeste method: ${req.method}`);
  // Log.info(`Requeste body: ${JSON.stringify(req.body)}`);
  // console.log();
  res.status(200).json({ connection: true, msg: "Connected Successfully!!!" });
});
// -----------------------
