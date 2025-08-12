// Kambaz/Questions/attempts/routes.js
import express from "express";
import * as dao from "./dao.js";

const router = express.Router();

// POST /api/quizzes/:qid/attempts
router.post("/api/quizzes/:qid/attempts", async (req, res) => {
  try {
    const userId = req.session?.currentUser?._id || req.body.user; // fallback for dev
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const attempt = await dao.submitAttempt({
      quizId: req.params.qid,
      userId,
      answersByQid: req.body?.answersByQid || {},
    });
    res.json(attempt);
  } catch (e) {
    if (e.code === "NO_ATTEMPTS") {
      return res.status(403).json({ message: "No attempts remaining" });
    }
    res.status(400).json({ message: e.message || "Failed to submit attempt" });
  }
});

// GET /api/quizzes/:qid/attempts/me/last
router.get("/api/quizzes/:qid/attempts/me/last", async (req, res) => {
  const userId = req.session?.currentUser?._id || req.query.user;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  const doc = await dao.getMyLastAttempt(req.params.qid, userId);
  res.json(doc || null);
});

// GET /api/quizzes/:qid/attempts/me
router.get("/api/quizzes/:qid/attempts/me", async (req, res) => {
  const userId = req.session?.currentUser?._id || req.query.user;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  res.json(await dao.listMyAttempts(req.params.qid, userId));
});

// Export in function-style so you can call AttemptRoutes(app)
export default function AttemptRoutes(app) {
  app.use(router);
}