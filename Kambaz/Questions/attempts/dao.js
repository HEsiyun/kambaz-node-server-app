// src/Questions/attempts/dao.js
import { v4 as uuid } from "uuid";
import AttemptModel from "./model.js";
import QuestionModel from "../model.js";     // existing question model
import QuizModel from "../../Quizzes/model.js"; // quiz model where settings live

// Grade one student answer against a question doc
function gradeOne(qDoc, payload) {
    const base = {
      question: qDoc._id,
      type: qDoc.type,
      points: qDoc.points ?? 0,
      correct: false,
      awarded: 0,
    };
  
    if (qDoc.type === "MC") {
      // accept either {choiceId} or a plain string id
      const choiceId =
        typeof payload === "string" ? payload : payload?.choiceId || "";
      const correctChoice = (qDoc.choices || []).find((c) => c.isCorrect);
      const correct = !!correctChoice && correctChoice._id === choiceId;
      return { ...base, choiceId, correct, awarded: correct ? base.points : 0 };
    }
  
    if (qDoc.type === "TF") {
      // accept either {booleanAnswer} or a bare boolean
      const student =
        typeof payload === "boolean" ? payload : !!payload?.booleanAnswer;
      const correct = student === !!qDoc.correctBoolean;
      return { ...base, booleanAnswer: student, correct, awarded: correct ? base.points : 0 };
    }
  
    // FIB – accept {textAnswer} or a bare string
    const raw = typeof payload === "string" ? payload : String(payload?.textAnswer ?? "");
    const caseInsensitive = qDoc.caseInsensitive !== false; // default true
    const trimmed = qDoc.trimInput !== false ? raw.trim() : raw;
    const answers = (qDoc.acceptableAnswers || []).map(String);
    const norm = (s) => (caseInsensitive ? s.toLowerCase() : s);
    const correct = answers.some((a) => norm(a.trim()) === norm(trimmed));
    return { ...base, textAnswer: raw, correct, awarded: correct ? base.points : 0 };
  }
  
  // Create a graded attempt, enforcing attempts allowed
  export const submitAttempt = async ({ quizId, userId, answersByQid }) => {
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) throw new Error("Quiz not found");
  
    const allowMulti = !!quiz.settings?.multipleAttempts;
    const maxAttempts = allowMulti ? Number(quiz.settings?.attemptsAllowed || 1) : 1;
  
    const used = await AttemptModel.countDocuments({ quiz: quizId, user: userId });
    if (used >= maxAttempts) {
      const err = new Error("No attempts remaining");
      err.code = "NO_ATTEMPTS";
      throw err;
    }
  
    const questions = await QuestionModel.find({ quiz: quizId }).sort({ createdAt: 1 });
    const graded = questions.map((q) => gradeOne(q, answersByQid[q._id]));
  
    const totalPoints = graded.reduce((a, g) => a + (Number(g.points) || 0), 0);
    const score = graded.reduce((a, g) => a + (Number(g.awarded) || 0), 0);
  
    const doc = {
      _id: uuid(),
      quiz: quizId,
      user: userId,
      attempt: used + 1,
      items: graded,          // keep detailed items
      totalPoints,
      score,
    };
  
    return AttemptModel.create(doc);
  };
  

export const listMyAttempts = (quizId, userId) =>
  AttemptModel.find({ quiz: quizId, user: userId }).sort({ attempt: -1 });

export const getMyLastAttempt = (quizId, userId) =>
  AttemptModel.findOne({ quiz: quizId, user: userId }).sort({ attempt: -1 });