// Kambaz/Assignments/schema.js
import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },                // <- STRING id
    course: { type: String, ref: "CourseModel", required: true }, // course ids are strings in your app
    title: { type: String, required: true },
    description: String,
    points: { type: Number, default: 100 },
    dueDate: Date,
    availableFrom: Date,
    availableUntil: Date,
  },
  { collection: "assignments", timestamps: true }
);

// Optional: accept legacy `name` from client
assignmentSchema.pre("validate", function (next) {
  if (!this.title && this.name) this.title = this.name;
  next();
});

export default assignmentSchema;