const router = require("express").Router();
const authChecker = require("../../util/authChecker");
const referService = require("./refer.service");

router.get("/", authChecker, async (req, res) => {
    try {
        const response = await referService.getAll(req.params.id);
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

router.get("/user/:id", authChecker, async (req, res) => {
    try {
        const response = await referService.getAllRefer(req.params.id);
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

router.get("/board", async (req, res) => {
    try {
        const { date, type, timeframe } = req.query;
        const response = await referService.statistic_board({ date, type, timeframe });
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

router.patch("/board", async (req, res) => {
    try {
        const { date, type, timeframe } = req.body;
        const response = await referService.statistic_board({ date, type, timeframe });
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

router.get('/gen', authChecker, async (req, res) => {
    try {
        const { gen, user } = req.query;
        const response = await referService.getReferHintory(user, gen);
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

router.get('/statistic', authChecker, async (req, res) => {
    try {
        const { _id } = req.user;
        const response = await referService.statistic(_id);
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

router.get('/statistic/:id', authChecker, async (req, res) => {
    try {
        const response = await referService.statistic2(req.params.id);
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

module.exports = router;