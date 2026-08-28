const authChecker = require("../../util/authChecker");
const messageService = require("./message.service");
const router = require("express").Router();

const createMessage = async (req, res) => {
    try {
        const data = {
            ...req.body,
            sender: req.user._id
        };
        const result = await messageService.createMessage(data);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const createNewChat = async (req, res) => {
    try {
        const data = req.body;
        const result = await messageService.createNewChat(data);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const getChats = async (req, res) => {
    try {
        const result = await messageService.getChats();
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const chatByUser = async (req, res) => {
    try {
        const limit = req.query.limit || 100;
        const page = req.query.page || 1;
        const skip = (page - 1) * limit;
        const data = {
            limit: parseInt(limit, 10),
            page: parseInt(page, 10),
            skip: parseInt(skip, 10)
        };
        const result = await messageService.chatByUser(req.params.id, data);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const getAChat = async (req, res) => {
    try {
        const result = await messageService.getAChat(req.params.id);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const result = await messageService.getMessages(req.query);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const searchMessages = async (req, res) => {
    try {
        const result = await messageService.searchMessages(req.query);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const result = await messageService.deleteMessage(req.params.id);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const markChat = async (req, res) => {
    try {
        const result = await messageService.markChat(req.params.id);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const seenMessage = async (req, res) => {
    try {
        const result = await messageService.seenMessage(req.params.id);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const getAllMessages = async (req, res) => {
    try {
        const result = await messageService.getAllMessages(req.query);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const updateMessage = async (req, res) => {
    try {
        const result = await messageService.updateMessage(req.params.id, req.body);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

// Protect message routes with authChecker
router.post("/", authChecker, createMessage);
router.post("/chat", authChecker, createNewChat);
router.put("/chat/:id", authChecker, markChat);
router.put("/update/:id", authChecker, updateMessage);
router.put("/seen/:id", authChecker, seenMessage);
router.get("/chats", authChecker, getChats);
router.get("/user/:id", authChecker, chatByUser);
router.get("/msg/all", authChecker, getMessages);
router.get("/msg/search", authChecker, searchMessages);
router.get("/all/msg", authChecker, getAllMessages);
router.get("/:id", authChecker, getAChat);
router.delete("/:id", authChecker, deleteMessage);

module.exports = router;