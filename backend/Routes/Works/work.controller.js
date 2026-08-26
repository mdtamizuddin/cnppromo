const router = require("express").Router();
const authChecker = require("../../util/authChecker");
const roleChecker = require("../../util/roleChecker");
const workService = require("./work.service");
const mongoose = require("mongoose");

router.post("/", authChecker, roleChecker(['admin']), async (req, res) => {
    try {
        const work = await workService.createWork(req.body);
        res.send(work);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const works = await workService.getAllWork(req.query);
        res.send(works);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send({
                message: "Invalid Work ID",
                status: 400
            });
        }
        const work = await workService.getSingleWork(req.params.id);
        res.send(work);
    } catch (error) {
        res.status(500).send({
            message: error.message,
            status: 500
        });
    }
});

router.put('/:id', authChecker, roleChecker(['admin']), async (req, res) => {
    try {
        const work = await workService.updateWork(req.params.id, req.body);
        res.send(work);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

router.delete('/:id', authChecker, roleChecker(['admin']), async (req, res) => {
    try {
        const work = await workService.deleteWork(req.params.id);
        res.send(work);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

module.exports = router;