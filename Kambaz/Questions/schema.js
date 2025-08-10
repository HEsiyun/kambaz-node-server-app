import mongoose from "mongoose";

const choiceSchema = new mongoose.Schema(
  {
    _id: String,             // e.g., "c1"
    text: String,
    isCorrect: Boolean
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    _id: String,                                  // e.g., "QZ101-Q1"
    quiz: { type: String, ref: "QuizModel" },     // "QZ101"
    type: { type: String, enum: ["MC", "TF", "FIB"], required: true },
    title: String,
    points: { type: Number, default: 5 },
    prompt: String,

    // MC only
    choices: [choiceSchema],
    shuffle: { type: Boolean, default: true },

    // TF only
    answer: Boolean, // true/false

    // FIB only
    answers: [String],
    caseInsensitive: { type: Boolean, default: true },
    trimInput: { type: Boolean, default: true }
  },
  { collection: "questions", timestamps: true }
);

export default questionSchema;