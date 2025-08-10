import mongoose from "mongoose";
import questionSchema from "./schema.js";
const QuestionModel = mongoose.model("QuestionModel", questionSchema);
export default QuestionModel;