import * as dao from "./Dao.js";

export default function QuizRoutes(app) {
  // list for a course
  app.get("/api/courses/:cid/quizzes", async (req, res) => {
    const { cid } = req.params;
    res.json(await dao.findQuizzesByCourse(cid));
  });

  // read one
  app.get("/api/quizzes/:qid", async (req, res) => {
    const { qid } = req.params;
    const quiz = await dao.findQuizById(qid);
    if (!quiz) return res.sendStatus(404);
    res.json(quiz);
  });

  // create quiz under course
  app.post("/api/courses/:cid/quizzes", async (req, res) => {
    const { cid } = req.params;
    const created = await dao.createQuiz(cid, req.body);
    res.json(created);
  });

  // update quiz
  app.put("/api/quizzes/:qid", async (req, res) => {
    const { qid } = req.params;
    const status = await dao.updateQuiz(qid, req.body);
    res.json(status);
  });

  // delete quiz
  app.delete("/api/quizzes/:qid", async (req, res) => {
    const { qid } = req.params;
    const status = await dao.deleteQuiz(qid);
    res.json(status);
  });

  // publish/unpublish
  app.put("/api/quizzes/:qid/publish", async (req, res) => {
    const { qid } = req.params;
    const { published } = req.body; // boolean
    const status = await dao.setPublished(qid, !!published);
    res.json(status);
  });

  // optional: compute total points from questions
  app.get("/api/quizzes/:qid/points", async (req, res) => {
    const { qid } = req.params;
    const total = await dao.getQuizPoints(qid);
    res.json({ quiz: qid, total });
  });
}