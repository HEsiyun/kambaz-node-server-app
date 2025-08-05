import * as modulesDao from "./dao.js";
export default function ModuleRoutes(app) {
  const deleteModule = async (req, res) => {
    const { moduleId } = req.params;
    const status = await modulesDao.deleteModule(moduleId);
    res.send(status);
  };
  const updateModule = async (req, res) => {
    const { moduleId } = req.params;
    const moduleUpdates = req.body;
    const status = await modulesDao.updateModule(moduleId, moduleUpdates);
    res.send(status);
  };
  app.put("/api/modules/:moduleId", updateModule);
  app.delete("/api/modules/:moduleId", deleteModule);
}
