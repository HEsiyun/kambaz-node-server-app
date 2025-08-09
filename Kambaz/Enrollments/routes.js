// Kambaz/Enrollments/routes.js
import * as dao from "./dao.js";

export default function EnrollmentsRoutes(app) {
  // GET /api/enrollments?user=UID  -> courses for a user
  // GET /api/enrollments?course=CID -> users in a course
  app.get("/api/enrollments", async (req, res) => {
    try {
      const { user, course } = req.query;

      if (user) {
        const courses = await dao.findCoursesForUser(user);
        return res.json(courses);
      }

      if (course) {
        const users = await dao.findUsersForCourse(course);
        return res.json(users);
      }

      // No "findAll" in your DAO; return 400 or implement one if needed
      return res
        .status(400)
        .json({ message: "Provide either ?user=UID or ?course=CID" });
    } catch (err) {
      console.error("GET /api/enrollments error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // POST /api/enrollments   { user, course }
  app.post("/api/enrollments", async (req, res) => {
    try {
      const { user, course } = req.body;
      if (!user || !course) {
        return res.status(400).json({ message: "user and course are required" });
      }
      const record = await dao.enrollUserInCourse(user, course);
      res.json(record);
    } catch (err) {
      console.error("POST /api/enrollments error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // DELETE /api/enrollments?user=UID&course=CID
  app.delete("/api/enrollments", async (req, res) => {
    try {
      const { user, course } = req.query;
      if (!user || !course) {
        return res.status(400).json({ message: "user and course are required" });
      }
      const result = await dao.unenrollUserFromCourse(user, course);
      res.json(result);
    } catch (err) {
      console.error("DELETE /api/enrollments error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });
}