import * as dao from "./dao.js";

export default function AssignmentRoutes(app) {
  // list everything (optional, handy for admin)
  app.get("/api/assignments", async (req, res) => {
    res.json(await dao.findAllAssignments());
  });

  // list for a course
  app.get("/api/courses/:cid/assignments", async (req, res) => {
    const { cid } = req.params;
    res.json(await dao.findAssignmentsByCourse(cid));
  });

  // read one
  app.get("/api/assignments/:aid", async (req, res) => {
    const { aid } = req.params;
    res.json(await dao.findAssignmentById(aid));
  });

  // create under a course
  app.post("/api/courses/:cid/assignments", async (req, res) => {
    const { cid } = req.params;
    const assignment = await dao.createAssignment(cid, req.body);
    res.json(assignment);
  });

  // update
  app.put("/api/assignments/:aid", async (req, res) => {
    const { aid } = req.params;
    const status = await dao.updateAssignment(aid, req.body);
    res.json(status);
  });

  // delete
  app.delete("/api/assignments/:aid", async (req, res) => {
    const { aid } = req.params;
    const status = await dao.deleteAssignment(aid);
    res.json(status);
  });
}