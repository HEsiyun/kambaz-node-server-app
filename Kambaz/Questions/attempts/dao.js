import { v4 as uuid } from "uuid";
import AttemptModel from "./model.js";
import QuestionModel from "../model.js";
import QuizModel from "../../Quizzes/model.js";

/* -------------------- helpers -------------------- */
const toBool = (v) => (typeof v === "boolean" ? v : !!v);

/** Count blanks like __1__, __2__, ... in the HTML prompt */
function countBlanksInPrompt(html = "") {
  if (!html || typeof html !== "string") return 0;
  const matches = html.match(/__\s*\d+\s*__/g);
  return matches ? matches.length : 0;
}

/** Normalize a student's FIB payload to an array of strings. */
function fibStudentAnswers(payload) {
  if (Array.isArray(payload)) return payload.map((s) => String(s ?? ""));
  if (payload && Array.isArray(payload.textAnswers))
    return payload.textAnswers.map((s) => String(s ?? ""));
  if (payload && typeof payload === "object" && "textAnswer" in payload)
    return [String(payload.textAnswer ?? "")];
  if (typeof payload === "string") return [payload];
  return [""];
}

/**
 * Normalize acceptable answers grouped per blank from the question doc.
 * Priority:
 *   1) acceptableAnswersByBlank: string[][] (already grouped)
 *   2) If prompt has N blanks and acceptableAnswers/answers has length N,
 *      treat each entry as the accepted answer for that blank.
 *   3) Otherwise, treat acceptableAnswers/answers as a single-blank list.
 */
function fibAcceptedAnswersByBlank(qDoc) {
  if (Array.isArray(qDoc.acceptableAnswersByBlank) && qDoc.acceptableAnswersByBlank.length) {
    return qDoc.acceptableAnswersByBlank.map((arr) =>
      (arr || []).map((s) => String(s ?? "")).filter(Boolean)
    );
  }

  const flat =
    (Array.isArray(qDoc.acceptableAnswers) && qDoc.acceptableAnswers.length
      ? qDoc.acceptableAnswers
      : Array.isArray(qDoc.answers) && qDoc.answers.length
      ? qDoc.answers
      : []) || [];
  const flatClean = flat.map((s) => String(s ?? "")).filter(Boolean);

  const blanksInPrompt = countBlanksInPrompt(qDoc.prompt || qDoc.title || "");
  if (blanksInPrompt > 1 && flatClean.length === blanksInPrompt) {
    return flatClean.map((ans) => [ans]);
  }
  return [flatClean];
}

/* -------------------- grading -------------------- */
function gradeOne(qDoc, payload) {
  const base = {
    question: qDoc._id,
    type: qDoc.type,
    points: qDoc.points ?? 0,
    correct: false,
    awarded: 0,
  };

  if (qDoc.type === "MC") {
    const choiceId = typeof payload === "string" ? payload : (payload && payload.choiceId) || "";
    const correctChoice = (qDoc.choices || []).find((c) => c.isCorrect);
    const correct = !!correctChoice && correctChoice._id === choiceId;
    return { ...base, choiceId, correct, awarded: correct ? base.points : 0 };
  }

  if (qDoc.type === "TF") {
    const student = typeof payload === "boolean" ? payload : toBool(payload?.booleanAnswer);
    const correct = student === toBool(qDoc.correctBoolean ?? qDoc.answer);
    return { ...base, booleanAnswer: student, correct, awarded: correct ? base.points : 0 };
  }

  // ---- FIB (supports multiple blanks) ----
  const studentAnswers = fibStudentAnswers(payload);
  const byBlank = fibAcceptedAnswersByBlank(qDoc); // string[] per blank

  const caseInsensitive = qDoc.caseInsensitive !== false; // default true
  const trimInput = qDoc.trimInput !== false; // default true
  const norm = (s) => {
    const t = trimInput ? String(s ?? "").trim() : String(s ?? "");
    return caseInsensitive ? t.toLowerCase() : t;
  };

  const blanks = Math.max(byBlank.length, studentAnswers.length);
  const perBlankCorrect = Array.from({ length: blanks }, (_, i) => {
    const accepted = (byBlank[i] || []).map((a) => norm(a));
    const student = norm(studentAnswers[i] ?? "");
    if (!accepted.length) return false;
    return accepted.includes(student);
  });

  const allCorrect = perBlankCorrect.every(Boolean);

  return {
    ...base,
    textAnswer: studentAnswers.join(" | "), // keep legacy single string
    textAnswers: studentAnswers,            // NEW: per-blank answers
    correct: allCorrect,
    awarded: allCorrect ? base.points : 0,
  };
}

/* -------------------- attempts -------------------- */
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
  const graded = questions.map((q) => gradeOne(q, answersByQid?.[q._id]));

  const totalPoints = graded.reduce((a, g) => a + (Number(g.points) || 0), 0);
  const score = graded.reduce((a, g) => a + (Number(g.awarded) || 0), 0);

  const doc = {
    _id: uuid(),
    quiz: quizId,
    user: userId,
    attempt: used + 1,
    items: graded,
    totalPoints,
    score,
  };

  return AttemptModel.create(doc);
};

export const listMyAttempts = (quizId, userId) =>
  AttemptModel.find({ quiz: quizId, user: userId }).sort({ attempt: -1 });

export const getMyLastAttempt = (quizId, userId) =>
  AttemptModel.findOne({ quiz: quizId, user: userId }).sort({ attempt: -1 });