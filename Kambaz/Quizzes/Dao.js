import { v4 as uuid } from "uuid";
import QuizModel from "./model.js";
import QuestionModel from "../Questions/model.js"; // used for point sums

export const findQuizzesByCourse = (courseId) =>
  QuizModel.find({ course: courseId }).sort({ createdAt: -1 });

export const findQuizById = (qid) => QuizModel.findById(qid);

export const createQuiz = (courseId, data = {}) => {
  const _id = data._id || uuid();
  return QuizModel.create({ ...data, _id, course: courseId, published: false });
};

export const updateQuiz = (qid, updates) =>
  QuizModel.updateOne({ _id: qid }, { $set: { ...updates } });

export const deleteQuiz = (qid) => QuizModel.deleteOne({ _id: qid });

export const setPublished = (qid, published) =>
  QuizModel.updateOne({ _id: qid }, { $set: { published } });

/** Optionally compute the total points from all its questions */
export const getQuizPoints = async (qid) => {
  const agg = await QuestionModel.aggregate([
    { $match: { quiz: qid } },
    { $group: { _id: "$quiz", total: { $sum: "$points" } } },
  ]);
  return agg[0]?.total ?? 0;
};