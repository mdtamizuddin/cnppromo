const services = require("./training.service");
const authChecker = require("../../util/authChecker");
const roleChecker = require("../../util/roleChecker");
const router = require("express").Router();

// ── Handlers ────────────────────────────────────────────────────────────

const getPayload = async (req, res) => {
    try {
        const result = await services.getTrainingPayload();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

const getAll = async (req, res) => {
    try {
        const [courses, trainers, quickActions] = await Promise.all([
            services.getAllCourses(),
            services.getAllTrainers(),
            services.getAllQuickActions(),
        ]);
        res.status(200).send({ courses, trainers, quickActions });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Courses
const createCourse = async (req, res) => {
    try {
        const result = await services.createCourse(req.body);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
const updateCourse = async (req, res) => {
    try {
        const result = await services.updateCourse(req.params.id, req.body);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
const deleteCourse = async (req, res) => {
    try {
        const result = await services.deleteCourse(req.params.id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Trainers
const createTrainer = async (req, res) => {
    try {
        const result = await services.createTrainer(req.body);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
const updateTrainer = async (req, res) => {
    try {
        const result = await services.updateTrainer(req.params.id, req.body);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
const deleteTrainer = async (req, res) => {
    try {
        const result = await services.deleteTrainer(req.params.id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Quick Actions
const createQuickAction = async (req, res) => {
    try {
        const result = await services.createQuickAction(req.body);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
const updateQuickAction = async (req, res) => {
    try {
        const result = await services.updateQuickAction(req.params.id, req.body);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
const deleteQuickAction = async (req, res) => {
    try {
        const result = await services.deleteQuickAction(req.params.id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// ── Routes ───────────────────────────────────────────────────────────────
router.get("/payload", authChecker, getPayload);
router.get("/all", authChecker, roleChecker(["admin", "moderator"]), getAll);

router.post("/course", authChecker, roleChecker(["admin"]), createCourse);
router.put("/course/:id", authChecker, roleChecker(["admin"]), updateCourse);
router.delete("/course/:id", authChecker, roleChecker(["admin"]), deleteCourse);

router.post("/trainer", authChecker, roleChecker(["admin"]), createTrainer);
router.put("/trainer/:id", authChecker, roleChecker(["admin"]), updateTrainer);
router.delete("/trainer/:id", authChecker, roleChecker(["admin"]), deleteTrainer);

router.post("/quick-action", authChecker, roleChecker(["admin"]), createQuickAction);
router.put("/quick-action/:id", authChecker, roleChecker(["admin"]), updateQuickAction);
router.delete("/quick-action/:id", authChecker, roleChecker(["admin"]), deleteQuickAction);

module.exports = router;
