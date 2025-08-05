// Kambaz/Assignments/dao.js
import { v4 as uuidv4 } from "uuid";
import initialAssignments from "../Database/assignments.js";

let assignments = [...initialAssignments];

export const findAllAssignments = () => assignments;

export const findAssignmentsByCourse = (cid) =>
  assignments.filter((a) => a.course === cid);

export const findAssignmentById = (aid) =>
  assignments.find((a) => a._id === aid);

export const createAssignment = (assignment) => {
  const newAssignment = { ...assignment, _id: uuidv4() };
  assignments.push(newAssignment);
  return newAssignment;
};

export const updateAssignment = (aid, updates) => {
  const idx = assignments.findIndex((a) => a._id === aid);
  if (idx === -1) return null;
  assignments[idx] = { ...assignments[idx], ...updates };
  return assignments[idx];
};

export const deleteAssignment = (aid) => {
  const idx = assignments.findIndex((a) => a._id === aid);
  if (idx === -1) return null;
  const [removed] = assignments.splice(idx, 1);
  return removed;
};