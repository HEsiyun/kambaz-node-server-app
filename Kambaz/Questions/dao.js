import { v4 as uuid } from "uuid";
import QuestionModel from "./model.js";

const normalizePayload = (data = {}) => {
  const upd = { ...data };

  // ---- Normalize by type ----
  if (upd.type === "MC") {
    upd.choices = (upd.choices || []).map((c) => ({
      _id: String(c._id || uuid()),
      text: String(c.text ?? ""),
      isCorrect: !!c.isCorrect,
    }));
    // Remove fields from other types
    delete upd.answer;
    delete upd.answers;
    delete upd.correctBoolean;
    delete upd.acceptableAnswers;
    delete upd.acceptableAnswersByBlank;
  } else if (upd.type === "TF") {
    // Accept either 'correctBoolean' or legacy 'answer'
    upd.correctBoolean =
      typeof upd.correctBoolean === "boolean"
        ? upd.correctBoolean
        : !!upd.answer;
    // Remove unrelated fields
    delete upd.answer;
    delete upd.answers;
    delete upd.choices;
    delete upd.acceptableAnswers;
    delete upd.acceptableAnswersByBlank;
  } else if (upd.type === "FIB") {
    // Accept any of: blanks[][], acceptableAnswersByBlank, acceptableAnswers, answers
    const byBlank =
      upd.acceptableAnswersByBlank ??
      upd.blanks?.map((b) => b.answers ?? []) ??
      undefined;

    const single =
      upd.acceptableAnswers ??
      upd.answers ??
      (Array.isArray(byBlank) && byBlank.length > 0 ? byBlank[0] : []);

    // Clean up strings
    const clean = (arr) =>
      (arr || [])
        .map((s) => String(s ?? "").trim())
        .filter((s) => s.length > 0);

    if (byBlank) {
      upd.acceptableAnswersByBlank = byBlank.map(clean);
      upd.acceptableAnswers = clean(single);
    } else {
      delete upd.acceptableAnswersByBlank;
      upd.acceptableAnswers = clean(single);
    }

    // Remove unrelated fields
    delete upd.answer;
    delete upd.answers;
    delete upd.choices;
    delete upd.correctBoolean;
    delete upd.blanks;
  }

  return upd;
};

export const findQuestionsByQuiz = (qid) =>
  QuestionModel.find({ quiz: qid }).sort({ createdAt: 1 });

export const findQuestionById = (id) => QuestionModel.findById(id);

export const createQuestion = async (qid, data = {}) => {
  const _id = data._id || uuid();
  const base = { ...normalizePayload(data), _id, quiz: qid };
  return QuestionModel.create(base);
};

export const updateQuestion = async (id, updates) => {
  const cleaned = normalizePayload(updates);
  // never allow _id/quiz change via update
  delete cleaned._id;
  delete cleaned.quiz;

  await QuestionModel.updateOne({ _id: id }, { $set: cleaned });
  return QuestionModel.findById(id);
};

export const deleteQuestion = (id) => QuestionModel.deleteOne({ _id: id });