// Questions/routes.js
import * as dao from "./dao.js";
import QuizModel from "../Quizzes/model.js";

export default function QuestionRoutes(app) {
  // Helper: decide whether to reveal correct answers to this requester
  const shouldReveal = (quiz, user, previewFlag) => {
    // Faculty and explicit preview always see correct answers
    if (previewFlag === "1") return true;
    if (user?.role === "FACULTY") return true;

    const when = quiz?.settings?.showCorrectAfter || "NEVER";
    if (when === "IMMEDIATELY") return true;

    if (when === "AFTER_DUE") {
      const due = quiz?.dueDate ? new Date(quiz.dueDate).getTime() : null;
      if (due && Date.now() >= due) return true;
    }

    return false; // NEVER or not yet
  };

  // list by quiz (conditionally reveal correct answers)
  app.get("/api/quizzes/:qid/questions", async (req, res) => {
    try {
      const { qid } = req.params;
      const preview = req.query.preview; // "?preview=1" to force reveal (e.g., editor preview)
      const user = req.session?.currentUser;

      const quiz = await QuizModel.findById(qid).lean();
      if (!quiz) return res.status(404).json({ message: "Quiz not found" });

      const reveal = shouldReveal(quiz, user, preview);

      // Use dao then convert to plain objects so we can safely edit fields
      const docs = await dao.findQuestionsByQuiz(qid);
      const items = (await Promise.all(
        docs.map(async (d) => (typeof d.toObject === "function" ? d.toObject() : d))
      )).map((q) => {
        const out = { ...q };

        // Normalize TF: ensure both names exist when revealing
        if (out.type === "TF") {
          if (reveal) {
            if (typeof out.correctBoolean === "undefined" && typeof out.answer !== "undefined") {
              out.correctBoolean = !!out.answer;
            }
          } else {
            delete out.correctBoolean;
            delete out.answer;
          }
        }

        // MC: strip isCorrect unless revealing
        if (out.type === "MC" && Array.isArray(out.choices)) {
          out.choices = out.choices.map((c) => {
            if (reveal) return c;
            const { isCorrect, ...rest } = c;
            return rest;
          });
        }

        // FIB: we can leave acceptable answers in the payload; the client UI
        // already gates showing them. If you want to hide them at the transport
        // layer as well, uncomment the next block.
        /*
        if (!reveal && out.type === "FIB") {
          // Keep structure but remove content
          if (Array.isArray(out.acceptableAnswersByBlank)) {
            out.acceptableAnswersByBlank = out.acceptableAnswersByBlank.map(() => []);
          }
          out.acceptableAnswers = [];
        }
        */

        return out;
      });

      res.json(items);
    } catch (err) {
      res.status(500).json({ message: "Failed to load questions" });
    }
  });

  // read one (leave as-is)
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