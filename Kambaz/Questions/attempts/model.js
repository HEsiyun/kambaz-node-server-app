// src/Questions/attempts/model.js
import mongoose from "mongoose";
import attemptSchema from "./schema.js";
const AttemptModel = mongoose.model("AttemptModel", attemptSchema);
export default AttemptModel;