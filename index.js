// index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import mongoose from "mongoose";

import Hello from "./Hello.js";
import Lab5 from "./lab5/index.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentsRoutes from "./Kambaz/Enrollments/routes.js";
import QuizRoutes from "./Kambaz/Quizzes/routes.js";
import QuestionRoutes from "./Kambaz/Questions/routes.js";
import AttemptRoutes from "./Kambaz/Questions/attempts/routes.js";

/* ---------- DB connect ---------- */
const CONNECTION_STRING =
  process.env.DATABASE_CONNECTION_STRING ||
  "mongodb://127.0.0.1:27017/kambaz";

mongoose
  .connect(CONNECTION_STRING)
  .then(() => console.log("✅ Mongo connected"))
  .catch((err) => {
    console.error("❌ Mongo connection error:", err.message);
    process.exit(1);
  });

const app = express();

/* ---------- Trust proxy (required for secure cookies on Render) ---------- */
app.set("trust proxy", 1);

/* ---------- CORS ---------- */
const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_URL,      // e.g. https://final--kambaz-react-web-app-siyun.netlify.app
    credentials: true,       // send/receive cookies
  })
);

/* ---------- Body parsing ---------- */
app.use(express.json());

/* ---------- Session ---------- */
const isProd =
  process.env.NODE_ENV === "production" ||
  process.env.SERVER_ENV === "production";

app.use(
  session({
    secret: process.env.SESSION_SECRET || "kambaz",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: isProd ? "none" : "lax",
      secure: isProd,       // Render uses HTTPS → true in prod
      // ❌ DO NOT set "domain" here — it breaks cookies across Render/Netlify
    },
  })
);

/* ---------- Routes ---------- */
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentsRoutes(app);
QuizRoutes(app);
QuestionRoutes(app);
AttemptRoutes(app);
Hello(app);
Lab5(app);
UserRoutes(app);

/* ---------- Start ---------- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Server listening on port ${PORT}`)
);