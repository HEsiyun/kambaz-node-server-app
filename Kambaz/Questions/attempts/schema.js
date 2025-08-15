import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    question: { type: String, ref: "QuestionModel", required: true },
    type: { type: String, enum: ["MC", "TF", "FIB"], required: true },
    points: { type: Number, default: 0 },

    // student answers (one of these depending on type)
    choiceId: String,          // MC
    booleanAnswer: Boolean,    // TF
    textAnswer: String,        // FIB (joined for backward compat)
    textAnswers: [String],     // FIB (NEW) per-blank answers

    // grading
    correct: Boolean,
    awarded: { type: Number, default: 0 },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    _id: { type: String },                           // uuid
    quiz: { type: String, ref: "QuizModel", index: true },
    user: { type: String, ref: "UserModel", index: true },
    attempt: { type: Number, required: true },       // 1,2,3...
    submittedAt: { type: Date, default: Date.now },

    // summary
    score: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },

    // per-question results
    items: [answerSchema],
  },
  { collection: "quiz_attempts", timestamps: true }
);

attemptSchema.index({ quiz: 1, user: 1, attempt: -1 });

export default attemptSchema;