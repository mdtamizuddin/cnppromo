const services = require('./work.service');
const authChecker = require('../../util/authChecker');
const roleChecker = require('../../util/roleChecker');
const router = require("express").Router();

const createNewWork = async (req, res) => {
    try {
        const data = req.body;
        const result = await services.createWork(data);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const createNewWorkSubmit = async (req, res) => {
    try {
        const data = {
            ...req.body,
            userId: req.user._id
        };
        const result = await services.createWorkSubmit(data);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const getAllWorks = async (req, res) => {
    try {
        const user = req.user;
        const result = await services.getAllWorks(user);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const getAllWorkSubmits = async (req, res) => {
    try {
        const status = req.query.status;
        const result = await services.getAllWorkSubmits(status, {
            page: req.query.page,
            limit: req.query.limit,
        });
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const getAWork = async (req, res) => {
    try {
        const result = await services.getWorkById(req.params.id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const getAWorkSubmit = async (req, res) => {
    try {
        const status = req.query.status;
        const result = await services.getWorkSubmitById(req.params.id, status);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const updateAWork = async (req, res) => {
    try {
        const data = req.body;
        const result = await services.updateWork(req.params.id, data);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const updateAWorkSubmit = async (req, res) => {
    try {
        const data = req.body;
        const result = await services.updateWorkSubmit(req.params.id, data);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const deleteAWork = async (req, res) => {
    try {
        const result = await services.deleteWork(req.params.id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const deleteAWorkSubmit = async (req, res) => {
    try {
        const result = await services.deleteWorkSubmit(req.params.id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const completeAWorkSubmit = async (req, res) => {
    try {
        const result = await services.completeWorkSubmit(req.params.id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

// Route definitions with proper security middleware
router.post("/create", authChecker, roleChecker(['admin']), createNewWork);
router.post("/submit", authChecker, createNewWorkSubmit);
router.get("/all", authChecker, getAllWorks);
router.get("/all-submits", authChecker, roleChecker(['admin', 'moderator']), getAllWorkSubmits);
router.get("/:id", authChecker, getAWork);
router.get("/submit/:id", authChecker, getAWorkSubmit);
router.put("/:id", authChecker, roleChecker(['admin']), updateAWork);
router.put("/submit/:id", authChecker, roleChecker(['admin']), updateAWorkSubmit);
router.delete("/:id", authChecker, roleChecker(['admin']), deleteAWork);
router.delete("/submit/:id", authChecker, roleChecker(['admin']), deleteAWorkSubmit);
router.put("/complete/:id", authChecker, roleChecker(['admin']), completeAWorkSubmit);

module.exports = router;