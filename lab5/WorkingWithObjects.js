const assignment = {
    id: 1, title: "NodeJS Assignment",
    description: "Create a NodeJS server with ExpressJS",
    due: "2021-10-10", completed: false, score: 0,
    };
const module = {
    id: "mod1",
    name: "Introduction to React",
    description: "Learn the basics of React",
    course: "CS5610"
    };
export default function WorkingWithObjects(app) { 
    const getAssignment = (req, res) => { res.json(assignment); }; 
    const getAssignmentTitle = (req, res) => { res.json(assignment.title); };
    const setAssignmentTitle = (req, res) => { const { newTitle } = req.params; assignment.title = newTitle; res.json(assignment); };
    // UPDATE assignment score (as a number, via param)
    const setAssignmentScore = (req, res) => {
        const { newScore } = req.params;
        assignment.score = Number(newScore);
        res.json(assignment);
    };

    // UPDATE assignment completed (as boolean string: "true"/"false")
    const setAssignmentCompleted = (req, res) => {
        const { completed } = req.params;
        assignment.completed = completed === "true";
        res.json(assignment);
    };
    app.get("/lab5/assignment/title", getAssignmentTitle);
    app.get("/lab5/assignment", getAssignment);
    app.get("/lab5/assignment/title/:newTitle", setAssignmentTitle);
    app.get("/lab5/assignment/score/:newScore", setAssignmentScore);
    app.get("/lab5/assignment/completed/:completed", setAssignmentCompleted);

    // GET entire module object
    const getModule = (req, res) => { res.json(module); };

    // GET module name only
    const getModuleName = (req, res) => { res.json(module.name); };

    // UPDATE module name (set via param)
    const setModuleName = (req, res) => {
    const { newName } = req.params;
    module.name = newName;
    res.json(module);
    };

    // UPDATE module description
    const setModuleDescription = (req, res) => {
    const { newDescription } = req.params;
    module.description = newDescription;
    res.json(module);
    };
    app.get("/lab5/module", getModule);
    app.get("/lab5/module/name", getModuleName);
    app.get("/lab5/module/name/:newName", setModuleName);
    app.get("/lab5/module/description/:newDescription", setModuleDescription);

};
