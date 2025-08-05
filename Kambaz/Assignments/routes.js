// Kambaz/Assignments/routes.js
import * as dao from "./dao.js";

export default function AssignmentRoutes(app) {
  // Get all assignments or by course
  app.get("/api/assignments", (req, res) => {
    const { course } = req.query;
    if (course) {
      res.json(dao.findAssignmentsByCourse(course));
    } else {
      res.json(dao.findAllAssignments());
    }
  });

  // Get assignment by ID
  app.get("/api/assignments/:aid", (req, res) => {
    const a = dao.findAssignmentById(req.params.aid);
    if (!a) return res.status(404).json({ message: "Assignment not found" });
    res.json(a);
  });

  // Create assignment
  app.post("/api/assignments", (req, res) => {
    const a = dao.createAssignment(req.body);
    res.json(a);
  });

  // Update assignment
  app.put("/api/assignments/:aid", (req, res) => {
    const a = dao.updateAssignment(req.params.aid, req.body);
    if (!a) return res.status(404).json({ message: "Assignment not found" });
    res.json(a);
  });

  // Delete assignment
  app.delete("/api/assignments/:aid", (req, res) => {
    const a = dao.deleteAssignment(req.params.aid);
    if (!a) return res.status(404).json({ message: "Assignment not found" });
    res.json(a);
  });
}