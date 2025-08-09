// Kambaz/Assignments/dao.js
import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

/* READ ------------------------------------------------------------ */
export const findAllAssignments = async () =>
  model.find().sort({ createdAt: -1 }).lean();

export const findAssignmentsByCourse = async (cid) =>
  model.find({ course: cid }).sort({ createdAt: -1 }).lean();

export const findAssignmentById = async (aid) =>
  model.findById(aid).lean();

/* CREATE ---------------------------------------------------------- */
export const createAssignment = async (cid, assignment) => {
  // Defensive: accept either `title` or legacy `name`
  const payload = { ...assignment, course: cid };
  if (!payload.title && payload.name) {
    payload.title = payload.name;
    delete payload.name;
  }

  // You’re using string _id in schema, so generate one if absent
  if (!payload._id) payload._id = uuidv4();

  const doc = await model.create(payload);
  // Return a plain object for consistency with the reads
  return doc.toObject();
};

/* UPDATE ---------------------------------------------------------- */
// Return the updated document instead of a write result
export const updateAssignment = async (aid, updates) => {
  const payload = { ...updates };
  if (!payload.title && payload.name) {
    payload.title = payload.name;
    delete payload.name;
  }
  return model.findByIdAndUpdate(aid, { $set: payload }, { new: true, lean: true });
};

/* DELETE ---------------------------------------------------------- */
// Return the removed document (or null) – helpful to confirm
export const deleteAssignment = async (aid) =>
  model.findByIdAndDelete(aid, { lean: true });