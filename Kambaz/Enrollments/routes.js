// Kambaz/Enrollments/routes.js
import * as dao from "./dao.js";

export default function EnrollmentsRoutes(app) {
  /* GET /api/enrollments?user=UID&course=CID (both optional) */
  app.get("/api/enrollments", (req, res) => {
    const { user, course } = req.query;
    if (user)   return res.json(dao.findByUser(user));
    if (course) return res.json(dao.findByCourse(course));
    res.json(dao.findAll());
  });

  /* POST /api/enrollments   { user, course } */
  app.post("/api/enrollments", (req, res) => {
    const { user, course } = req.body;
    if (!user || !course) {
      return res.status(400).json({ message: "user & course required" });
    }
    const record = dao.enroll(user, course);
    if (!record) return res.status(409).json({ message: "already enrolled" });
    res.json(record);
  });

  /* DELETE /api/enrollments/:eid */
  app.delete("/api/enrollments/:eid", (req, res) => {
    const gone = dao.unenroll(req.params.eid);
    if (!gone) return res.status(404).json({ message: "enrollment not found" });
    res.json(gone);
  });
}