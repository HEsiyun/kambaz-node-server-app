import * as dao from "./dao.js";
import * as modulesDao from "../Modules/dao.js";
export default function CourseRoutes(app) {
  const findAllCourses = (req, res) => {
    const courses = dao.findAllCourses();
    res.send(courses);
  };
  const deleteCourse = (req, res) => {
    const { courseId } = req.params;
    const status = dao.deleteCourse(courseId);
    res.send(status);
  };
  const updateCourse = (req, res) => {
    const { courseId } = req.params;
    const courseUpdates = req.body;
    const status = dao.updateCourse(courseId, courseUpdates);
    res.send(status);
  };
  const findModulesForCourse = (req, res) => {
    const { courseId } = req.params;
    const modules = modulesDao.findModulesForCourse(courseId);
    res.json(modules);
  };
  const createModuleForCourse = (req, res) => {
    const { courseId } = req.params;
    const module = { ...req.body, course: courseId };
    const newModule = modulesDao.createModule(module);
    res.send(newModule);
  };
  app.post("/api/courses/:courseId/modules", createModuleForCourse);
  app.get("/api/courses/:courseId/modules", findModulesForCourse);
  app.put("/api/courses/:courseId", updateCourse);
  app.delete("/api/courses/:courseId", deleteCourse);
  app.get("/api/courses", findAllCourses);
}
