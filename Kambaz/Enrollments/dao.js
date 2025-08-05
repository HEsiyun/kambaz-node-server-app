// Kambaz/Enrollments/dao.js
import { v4 as uuidv4 } from "uuid";
import Database from "../Database/index.js";

const { enrollments } = Database;

/*------------------------------------------------------------------*/
/*  HELPERS                                                         */
/*------------------------------------------------------------------*/
export const findAll = () => enrollments;
export const findById = (eid) => enrollments.find((e) => e._id === eid);
export const findByUser = (uid) => enrollments.filter((e) => e.user === uid);
export const findByCourse = (cid) =>
  enrollments.filter((e) => e.course === cid);

export const enroll = (user, course) => {
  // avoid duplicate enrollments
  if (enrollments.some((e) => e.user === user && e.course === course))
    return null;
  const record = { _id: uuidv4(), user, course };
  enrollments.push(record);
  return record;
};

export const unenroll = (eid) => {
  const idx = enrollments.findIndex((e) => e._id === eid);
  if (idx === -1) return null;
  return enrollments.splice(idx, 1)[0];
};

export const enrollUserInCourse = enroll;