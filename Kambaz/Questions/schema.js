import mongoose from "mongoose";

const choiceSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    text: { type: String, default: "" },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    quiz: { type: String, index: true, required: true },

    type: { type: String, enum: ["MC", "TF", "FIB"], required: true },
    title: { type: String, default: "" },
    points: { type: Number, default: 0 },
    prompt: { type: String, default: "" },

    // MC
    choices: [choiceSchema],

    // TF
    correctBoolean: { type: Boolean },

    // FIB (single-blank, used by current grader & take UI)
    acceptableAnswers: { type: [String], default: [] },

    // FIB (multi-blank authoring; first blank is mirrored into acceptableAnswers)
    acceptableAnswersByBlank: { type: [[String]], default: undefined },
  },
  { collection: "questions", timestamps: true }
);

export default questionSchema;