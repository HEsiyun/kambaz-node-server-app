import { v4 as uuid } from "uuid";
import QuestionModel from "./model.js";

export const findQuestionsByQuiz = (qid) =>
  QuestionModel.find({ quiz: qid }).sort({ createdAt: 1 });

export const findQuestionById = (id) => QuestionModel.findById(id);

export const createQuestion = (qid, data = {}) => {
  const _id = data._id || uuid();
  return QuestionModel.create({ ...data, _id, quiz: qid });
};

export const updateQuestion = (id, updates) =>
  QuestionModel.updateOne({ _id: id }, { $set: { ...updates } });

export const deleteQuestion = (id) => QuestionModel.deleteOne({ _id: id });