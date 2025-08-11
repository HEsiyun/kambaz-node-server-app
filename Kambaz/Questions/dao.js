import { v4 as uuid } from "uuid";
import QuestionModel from "./model.js";

export const findQuestionsByQuiz = (qid) =>
  QuestionModel.find({ quiz: qid }).sort({ createdAt: 1 });

export const findQuestionById = (id) => QuestionModel.findById(id);

export const createQuestion = async (qid, data = {}) => {
  const _id = data._id || uuid();
  const base = { ...data, _id, quiz: qid };

  if (base.type === "MC") {
    base.choices = (base.choices || []).slice(0);
    delete base.answer;
    delete base.answers;
  } else if (base.type === "TF") {
    base.answer = !!base.answer;
    delete base.choices;
    delete base.answers;
  } else if (base.type === "FIB") {
    base.answers = (base.answers || []).filter(Boolean);
    delete base.answer;
    delete base.choices;
  }
  return QuestionModel.create(base);
};

export const updateQuestion = (id, updates) =>
  QuestionModel.updateOne({ _id: id }, { $set: { ...updates } });

export const deleteQuestion = (id) => QuestionModel.deleteOne({ _id: id });