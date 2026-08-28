const authChecker = require("../../util/authChecker");
const roleChecker = require("../../util/roleChecker");
const messageService = require("./message.service");
const Chat = require("./chat.model");
const Message = require("./message.model");
const router = require("express").Router();

// Admins and moderators run support tooling over other people's conversations;
// everyone else is confined to threads they are a participant in.
const isPrivileged = (req) => req.user.role === "admin" || req.user.role === "moderator";

const forbidden = (res) =>
    res.status(403).send({ message: "Forbidden: This conversation is not yours" });

// Confirms the caller owns or participates in the given chat.
const loadOwnChat = async (req, res, chatId) => {
    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404).send({ message: "Chat not found" });
        return null;
    }
    if (!isPrivileged(req)) {
        const me = req.user._id.toString();
        if (chat.owner?.toString() !== me && chat.user?.toString() !== me) {
            forbidden(res);
            return null;
        }
    }
    return chat;
};

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
        // The caller is always the owner of the chat they create — taking `owner`
        // from the body would let anyone open a thread on someone else's behalf.
        const data = {
            ...req.body,
            owner: req.user._id
        };
        const result = await messageService.createNewChat(data);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

// Full chat listing — support tooling only.
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
        // A regular user may only list their own conversations, whatever id they ask for.
        const targetId = isPrivileged(req) ? req.params.id : req.user._id.toString();
        const result = await messageService.chatByUser(targetId);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const getAChat = async (req, res) => {
    try {
        const chat = await loadOwnChat(req, res, req.params.id);
        if (!chat) return;
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
        const query = { ...req.query };
        if (!isPrivileged(req)) {
            const me = req.user._id.toString();
            if (query.sender !== me && query.receiver !== me) {
                return forbidden(res);
            }
        }
        const result = await messageService.getMessages(query);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const searchMessages = async (req, res) => {
    try {
        const query = { ...req.query };
        if (!isPrivileged(req)) {
            query.user = req.user._id.toString();
        }
        const result = await messageService.searchMessages(query);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).send({ message: "Message not found" });
        }
        if (!isPrivileged(req) && message.sender?.toString() !== req.user._id.toString()) {
            return res.status(403).send({ message: "Forbidden: You can only delete your own messages" });
        }
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
        const chat = await loadOwnChat(req, res, req.params.id);
        if (!chat) return;
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
        const chat = await loadOwnChat(req, res, req.params.id);
        if (!chat) return;
        const result = await messageService.seenMessage(req.params.id);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

// Cross-user message stream — support tooling only.
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
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).send({ message: "Message not found" });
        }
        if (!isPrivileged(req) && message.sender?.toString() !== req.user._id.toString()) {
            return res.status(403).send({ message: "Forbidden: You can only edit your own messages" });
        }
        // Only the text body is editable; sender/receiver/chat must stay fixed.
        const result = await messageService.updateMessage(req.params.id, {
            message: req.body.message
        });
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
router.get("/chats", authChecker, roleChecker(["admin", "moderator"]), getChats);
router.get("/user/:id", authChecker, chatByUser);
router.get("/msg/all", authChecker, getMessages);
router.get("/msg/search", authChecker, searchMessages);
router.get("/all/msg", authChecker, roleChecker(["admin", "moderator"]), getAllMessages);
router.get("/:id", authChecker, getAChat);
router.delete("/:id", authChecker, deleteMessage);

module.exports = router;
