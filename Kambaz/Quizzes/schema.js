import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    _id: String,                        // e.g., "QZ101"
    course: { type: String, required: true }, // "RS101"
    title: { type: String, required: true },
    description: String,

    // publish & dates
    published: { type: Boolean, default: false },
    availableFrom: Date,
    availableUntil: Date,
    dueDate: Date,

    // optional meta (keep it flexible)
    type: {
      type: String,
      enum: ["GRADED_QUIZ", "PRACTICE_QUIZ", "GRADED_SURVEY", "UNGRADED_SURVEY"],
      default: "GRADED_QUIZ",
    },
    settings: {
      shuffleAnswers: { type: Boolean, default: true },
      timeLimitMin: { type: Number, default: 20 },
      multipleAttempts: { type: Boolean, default: false },
      attemptsAllowed: { type: Number, default: 1 },
      showCorrectAfter: { type: String, default: "NEVER" }, // e.g., NEVER/IMMEDIATELY/AFTER_DUE
      accessCode: { type: String, default: "" },
      oneQuestionAtATime: { type: Boolean, default: true },
      webcamRequired: { type: Boolean, default: false },
      lockAfterAnswering: { type: Boolean, default: false },
    },
  },
  { collection: "quizzes", timestamps: true }
);

export default quizSchema;