import * as dao from "./dao.js";

export default function QuestionRoutes(app) {
  // list by quiz
  app.get("/api/quizzes/:qid/questions", async (req, res) => {
    const { qid } = req.params;
    res.json(await dao.findQuestionsByQuiz(qid));
  });

  // read one
  app.get("/api/questions/:id", async (req, res) => {
    const { id } = req.params;
    const q = await dao.findQuestionById(id);
    if (!q) return res.sendStatus(404);
    res.json(q);
  });

  // create under quiz
  app.post("/api/quizzes/:qid/questions", async (req, res) => {
    const { qid } = req.params;
    const created = await dao.createQuestion(qid, req.body);
    res.json(created);
  });

  // update
  app.put("/api/questions/:id", async (req, res) => {
    const { id } = req.params;
    const status = await dao.updateQuestion(id, req.body);
    res.json(status);
  });

  // delete
  app.delete("/api/questions/:id", async (req, res) => {
    const { id } = req.params;
    const status = await dao.deleteQuestion(id);
    res.json(status);
  });
}