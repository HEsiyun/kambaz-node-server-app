// Kambaz/Users/routes.js
import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
  // CREATE USER
  const createUser = async (req, res) => {
    const newUser = await dao.createUser(req.body);
    res.json(newUser);
  };

  // DELETE USER
  const deleteUser = async (req, res) => {
    const status = await dao.deleteUser(req.params.userId);
    res.json(status);
  };

  // FIND USER BY ID
  const findUserById = async (req, res) => {
    const user = await dao.findUserById(req.params.userId);
    res.json(user);
  };

  // UPDATE USER (also refresh session copy if it’s the same user)
  const updateUser = async (req, res) => {
    const { userId } = req.params;
    const userUpdates = req.body;
    await dao.updateUser(userId, userUpdates);

    const currentUser = req.session["currentUser"];
    if (currentUser && currentUser._id === userId) {
      req.session["currentUser"] = { ...currentUser, ...userUpdates };
      return res.json(req.session["currentUser"]);
    }

    // If we updated someone else, just return OK
    res.json({ status: "ok" });
  };

  // FIND ALL USERS (supports ?role= and ?name=)
  const findAllUsers = async (req, res) => {
    const { role, name } = req.query;
    if (role) {
      const users = await dao.findUsersByRole(role);
      return res.json(users);
    }
    if (name) {
      const users = await dao.findUsersByPartialName(name);
      return res.json(users);
    }
    const users = await dao.findAllUsers();
    res.json(users);
  };

  // SIGNUP
  const signup = async (req, res) => {
    const user = await dao.findUserByUsername(req.body.username);
    if (user) return res.status(400).json({ message: "Username already in use" });
    const newUser = await dao.createUser(req.body);
    res.json(newUser);
  };

  // SIGNIN
  const signin = async (req, res) => {
    const { username, password } = req.body;
    const currentUser = await dao.findUserByCredentials(username, password);
    if (!currentUser) {
      return res.status(401).json({ message: "Unable to login. Try again later." });
    }
    req.session["currentUser"] = currentUser;
    res.json(currentUser);
  };

  // PROFILE
  const profile = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) return res.sendStatus(401);
    res.json(currentUser);
  };

  // SIGNOUT
  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };

  // CREATE COURSE (and auto-enroll creator)
  const createCourse = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) return res.sendStatus(401);
    const newCourse = await courseDao.createCourse(req.body);
    await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };

  // === Enrollment endpoints required by textbook ==================

  // GET all courses for a user (uid can be "current")
  const findCoursesForUser = async (req, res) => {
    const sessUser = req.session["currentUser"];
    if (!sessUser) return res.sendStatus(401);
    let { uid } = req.params;
    if (uid === "current") uid = sessUser._id;

    // Admins can see all courses
    if (sessUser.role === "ADMIN") {
      const courses = await courseDao.findAllCourses();
      return res.json(courses);
    }

    const courses = await enrollmentsDao.findCoursesForUser(uid);
    res.json(courses);
  };

  // POST enroll a user in a course
  const enrollUserInCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) return res.sendStatus(401);
      uid = currentUser._id;
    }
    const status = await enrollmentsDao.enrollUserInCourse(uid, cid);
    res.send(status);
  };

  // DELETE unenroll a user from a course
  const unenrollUserFromCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) return res.sendStatus(401);
      uid = currentUser._id;
    }
    const status = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
    res.send(status);
  };

  // ================== ROUTES ======================================

  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);
  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);
  app.get("/api/users/:uid/courses", findCoursesForUser);
  app.post("/api/users/current/courses", createCourse);
  app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
  app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);
}