const Chat = require("./chat.model")
const Message = require("./message.model")
const mongoose = require('mongoose')
const User = require("../User/user.model")
const fs = require('fs')
const { deleteFromS3 } = require("../../util/s3")
// Fields a client may set on a new message. Everything else (sender, seen,
// likes, deleted) is decided by the server.
const MESSAGE_BODY_FIELDS = ["message", "image", "audio", "video"];

const isObjectId = (value) => /^[a-f0-9]{24}$/i.test(String(value ?? ""));

const httpError = (status, message) => Object.assign(new Error(message), { status });

// Checks a send request against the chat it names and returns the document to
// store. The sender must be one side of that chat and the receiver the other,
// and a reply may only quote a message from the same conversation.
const buildMessage = async (senderId, payload = {}) => {
    if (!isObjectId(payload.chat) || !isObjectId(payload.receiver)) {
        throw httpError(400, "chat and receiver are required");
    }
    // Plain strings from here on: a one-element array passes the format check
    // above but must not reach Mongoose as an array.
    const chatId = String(payload.chat);
    const receiver = String(payload.receiver);
    const reply = isObjectId(payload.reply) ? String(payload.reply) : null;

    const chat = await Chat.findById(chatId).select("owner user").lean();
    const sender = String(senderId);
    const other = receiver;
    const isParticipant = chat && (
        (String(chat.owner) === sender && String(chat.user) === other) ||
        (String(chat.owner) === other && String(chat.user) === sender)
    );
    if (!isParticipant) {
        throw httpError(403, "You are not a participant of this chat");
    }

    const doc = { sender: senderId, receiver, chat: chatId };
    for (const field of MESSAGE_BODY_FIELDS) {
        if (typeof payload[field] === "string" && payload[field].trim()) {
            doc[field] = payload[field];
        }
    }
    if (!MESSAGE_BODY_FIELDS.some((field) => doc[field])) {
        throw httpError(400, "Message is empty");
    }

    if (reply) {
        // populate('reply') returns the quoted message, so a reply pointing outside
        // this conversation would leak someone else's text. Drop it instead.
        const inThread = await Message.exists({
            _id: reply,
            $or: [
                { sender: senderId, receiver },
                { sender: receiver, receiver: senderId },
            ],
        });
        if (inThread) doc.reply = reply;
    }

    return doc;
};

const createMessage = async (senderId, payload) => {
    try {
        const doc = await buildMessage(senderId, payload);
        const newMessage = new Message({
            ...doc,
            seen: false
        })
        const result = await newMessage.save()
        await Chat.updateMany({
            $or: [
                { owner: doc.sender, user: doc.receiver },
                { owner: doc.receiver, user: doc.sender },
            ],
        }, {
            message: result._id
        })
        const message = await Message.findById(result._id)
            .populate('image')
            .populate('reply')
        return message

    } catch (error) {
        throw error
    }
}

const createNewChat = async (data) => {
    try {
        const { owner, user } = data;

        // Check if a chat already exists in both possible directions
        const [existingChat1, existingChat2] = await Promise.all([
            Chat.findOne({ user: owner, owner: user }),
            Chat.findOne({ user: user, owner: owner }),
        ]);

        // Create a new chat if no existing chat in either direction
        let newChat;
        if (!existingChat1) {
            await Chat.create({
                owner: user,
                user: owner,
            });
        }
        if (!existingChat2) {
            newChat = await Chat.create(data);
        }

        // Decide which chat to return: newChat or the existing one
        const chatToReturn = newChat || existingChat2;

        // Populate the chat before returning
        if (chatToReturn) {
            await chatToReturn.populate('owner', 'name username avatar active lastActive');
            await chatToReturn.populate('user', 'name username avatar active lastActive');
            await chatToReturn.populate('message');
        }

        return chatToReturn;
    } catch (error) {
        throw new Error(error.message || 'Error creating new chat');
    }
};


const getChats = async (filter = {}) => {
    try {
        // Fetch chats without population
        const chats = await Chat.find(filter)
            .populate('owner', 'name username avatar active lastActive')
            .populate('user', 'name username avatar active lastActive')
            .sort({ updatedAt: -1 })
        return chats;
    } catch (error) {
        throw new Error(error.message || 'Error fetching chats');
    }
};

// const chatByUser = async (id, data) => {
//     try {
//         const { skip, limit, page } = data;

//         // Fetch chats
//         const chats = await Chat.find({ owner: id })
//             .populate('user', 'name username avatar active lastActive')
//             .populate('message')
//             .sort({ updatedAt: -1 })
//             .lean(); // Use lean for faster query

//         const validChats = chats.filter(chat => chat.owner && chat.user);

//         // Collect all user IDs for unseen message counting
//         const userIds = validChats.map(chat => chat.user._id);

//         // Pre-fetch unseen message counts
//         const unseenMessagesCounts = await Message.aggregate([
//             {
//                 $match: {
//                     sender: { $in: userIds },
//                     seen: { $in: [false, null] }
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$sender",
//                     count: { $sum: 1 }
//                 }
//             },
//         ]);

//         // Attach unseen count to chats
//         const chatsWithUnseen = validChats.map(chat => ({
//             ...chat,
//             unseen: unseenMessagesCounts.find(um => um._id.toString() === chat.user._id.toString())?.count || 0,
//         }));

//         // Pagination calculation
//         const total = await Chat.countDocuments({ owner: id });
//         const totalPage = Math.ceil(total / limit);
//         const fChats = chatsWithUnseen.slice(skip, skip + limit);
//         const result = {
//             limit: fChats.length,
//             unseen: unseenMessagesCounts.length,
//             page,
//             skip,
//             nextPage: page + 1,
//             prevPage: page > 0 ? page - 1 : null,
//             hasNextPage: page < totalPage - 1,
//             hasPrevPage: page > 0,
//             totalPage,
//             total,
//             chats: fChats
//         };

//         return result;
//     } catch (error) {
//         console.error('Error in chatByUser:', error);
//         throw error; // Rethrow or customize if needed
//     }
// };

// Calendar day "YYYY-MM-DD" in the viewer's timezone → [start, end) as Dates.
// `tz` is the browser's getTimezoneOffset() in minutes (e.g. -360 for UTC+6).
const dayRange = (date, tz) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) return null;
    const [y, m, d] = date.split("-").map(Number);
    let offset = parseInt(tz, 10);
    if (!Number.isFinite(offset) || Math.abs(offset) > 840) offset = 0;
    const start = new Date(Date.UTC(y, m - 1, d) + offset * 60000);
    if (Number.isNaN(start.getTime())) return null;
    return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
};

const intersectIds = (a, b) => {
    const keep = new Set(b.map(String));
    return a.filter((x) => keep.has(String(x)));
};

// `privileged` callers (admin/moderator) may match on email and phone too. Regular
// users only see staff in their list, and matching on contact details would let
// them probe staff emails and phone numbers one keystroke at a time.
const chatByUser = async (id, query = {}, { privileged = false } = {}) => {
    try {
        const { cursor, sortby, limit = 40, search, date, tz } = query;
        const parsedLimit = parseInt(limit) || 40;
        const ownerId = new mongoose.Types.ObjectId(id);

        // Conversation partners that still exist. The soft-delete hook drops deleted
        // users from this distinct, so their chats leave both the list and the counts.
        const chatUserIds = await Chat.distinct("user", { owner: id });
        const liveUserIds = chatUserIds.length
            ? await User.distinct("_id", { _id: { $in: chatUserIds } })
            : [];

        const term = typeof search === "string" ? search.trim() : "";
        let visibleUserIds = liveUserIds;
        if (term && liveUserIds.length) {
            const regex = new RegExp(escapeRegex(term), "i");
            const fields = privileged ? ["name", "username", "email", "phone"] : ["name", "username"];
            visibleUserIds = await User.distinct("_id", {
                _id: { $in: liveUserIds },
                $or: fields.map((field) => ({ [field]: { $regex: regex } })),
            });
        }

        // Partners with at least one message to the owner that is still unseen.
        const unseenSenders = await Message.aggregate([
            { $match: { receiver: ownerId, seen: { $in: [false, null] } } },
            { $group: { _id: "$sender" } }
        ]);
        const unreadUserIds = intersectIds(unseenSenders.map((s) => s._id), liveUserIds);

        const filter = { owner: id };

        if (sortby === "Favourite") {
            filter.marked = true;
        }
        filter.user = {
            $in: sortby === "Unread" ? intersectIds(visibleUserIds, unreadUserIds) : visibleUserIds
        };

        // A chat's `message` is its latest message, and an ObjectId carries its
        // creation time, so the day filter needs no join.
        const range = date ? dayRange(date, tz) : null;
        if (range) {
            filter.message = {
                $gte: mongoose.Types.ObjectId.createFromTime(Math.floor(range.start.getTime() / 1000)),
                $lt: mongoose.Types.ObjectId.createFromTime(Math.floor(range.end.getTime() / 1000)),
            };
        }

        if (cursor) {
            const [cursorUpdatedAt, cursorId] = cursor.split('_');
            if (cursorUpdatedAt && cursorId) {
                filter.$or = [
                    { updatedAt: { $lt: new Date(cursorUpdatedAt) } },
                    {
                        updatedAt: new Date(cursorUpdatedAt),
                        _id: { $lt: cursorId }
                    }
                ];
            }
        }

        // Fetch limited chats using the compound index { owner: 1, updatedAt: -1, _id: -1 }
        const chats = await Chat.find(filter)
            .populate('user', 'name username avatar active lastActive')
            .populate('message')
            .sort({ updatedAt: -1, _id: -1 })
            .limit(parsedLimit + 1);

        const hasNextPage = chats.length > parsedLimit;
        const pagedChats = hasNextPage ? chats.slice(0, parsedLimit) : chats;

        let nextCursor = null;
        if (hasNextPage && pagedChats.length > 0) {
            const lastChat = pagedChats[pagedChats.length - 1];
            nextCursor = `${lastChat.updatedAt.toISOString()}_${lastChat._id}`;
        }

        const validChats = pagedChats.filter(chat => chat.owner && chat.user);
        const userIds = validChats.map(chat => chat.user._id);

        // Tab counts ignore search and day filters so the tabs stay stable while typing.
        const [totalAll, totalFavourite, unseenCounts] = await Promise.all([
            Chat.countDocuments({ owner: id, user: { $in: liveUserIds } }),
            Chat.countDocuments({ owner: id, marked: true, user: { $in: liveUserIds } }),
            userIds.length > 0 ? Message.aggregate([
                {
                    $match: {
                        receiver: ownerId,
                        sender: { $in: userIds },
                        seen: { $in: [false, null] }
                    }
                },
                {
                    $group: {
                        _id: "$sender",
                        count: { $sum: 1 }
                    }
                }
            ]) : []
        ]);

        const unseenMap = unseenCounts.reduce((acc, { _id, count }) => {
            acc[_id.toString()] = count;
            return acc;
        }, {});

        const unseenMessages = validChats.map(chat => {
            const doc = chat.toObject ? chat.toObject() : chat;
            return {
                ...doc,
                unseen: unseenMap[chat.user._id.toString()] || 0
            };
        });

        return {
            chats: unseenMessages,
            nextCursor,
            totalAll,
            totalFavourite,
            totalUnread: unreadUserIds.length
        };
    } catch (error) {
        throw new Error(error.message || 'Error fetching chats');
    }
};
// Anything the user types is matched literally. Passing raw input to $regex lets a
// stray `(` throw, and a crafted pattern like `(a+)+$` pin the event loop.
const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SEARCH_LIMIT = 50;

const searchMessages = async (query) => {
    try {
        const { user, text } = query;

        if (!text || !String(text).trim()) {
            return { total: 0, messages: [] };
        }

        const result = await Message.find({
            $or: [
                { sender: user },
                { receiver: user }
            ],
            message: { $regex: escapeRegex(text.trim()), $options: 'i' }
        }).populate('sender', 'name username avatar active lastActive')
            .populate('receiver', 'name username avatar active lastActive')
            .sort({ _id: -1 })
            .limit(SEARCH_LIMIT)

        return {
            total: result.length,
            messages: result
        };
    } catch (error) {
        console.error("Error in searchMessages:", error);
        throw error; // Preserves stack trace
    }
}

const getAChat = async (id) => {
    try {

        const chat = await Chat.findById(id)
            .populate('owner', 'name username avatar active lastActive')
            .populate('user', 'name username avatar active lastActive')
        if (!chat) {
            throw new Error('Chat not found');
        }

        return chat
    } catch (error) {
        throw new Error(error)
    }
}

const getAllMessages = async (query) => {
    try {
        const limit = parseInt(query.limit) || 100
        const page = parseInt(query.page) || 1
        const skip = (page - 1) * limit;
        const filter = {}

        if (query.user) {
            filter.$or = [
                { sender: query.user },
                { receiver: query.user }
            ];
        }
        const messages = await Message.find(filter)
            .populate('sender', 'name username avatar')
            .populate('receiver', 'name username avatar')
            .populate('reply')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
        return messages
    } catch (error) {
        throw new Error(error)
    }
}


const getMessages = async (query) => {
    try {
        const sender = query.sender;
        const receiver = query.receiver;
        const limit = Math.min(Math.max(parseInt(query.limit, 10) || 30, 1), 100);
        const cursor = query.cursor; // message _id (ISO timestamps from older clients still work)

        if (!sender || !receiver) {
            throw new Error("sender and receiver are required");
        }

        const filter = {
            $or: [
                { sender: sender, receiver: receiver },
                { sender: receiver, receiver: sender },
            ]
        };

        // Sorting and paging on _id lets the {sender, receiver, _id} indexes serve
        // the query; sorting on createdAt forced an in-memory sort of the whole
        // conversation, and equal timestamps could drop messages at page edges.
        if (cursor) {
            if (isObjectId(cursor)) {
                filter._id = { $lt: new mongoose.Types.ObjectId(String(cursor)) };
            } else {
                const cursorDate = new Date(cursor);
                if (!isNaN(cursorDate.getTime())) {
                    filter.createdAt = { $lt: cursorDate };
                }
            }
        }

        const messages = await Message.find(filter)
            .populate("reply")
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean();

        const hasNextPage = messages.length > limit;
        const sliced = hasNextPage ? messages.slice(0, limit) : messages;

        // Oldest in this slice is the next cursor for older messages
        const nextCursor = hasNextPage && sliced.length > 0
            ? String(sliced[sliced.length - 1]._id)
            : null;

        // Return chronological order (oldest to newest for this page)
        return {
            messages: sliced.reverse(),
            nextCursor,
            hasNextPage
        };
    } catch (error) {
        throw new Error(error);
    }
}
const markChat = async (id) => {
    try {
        const chat = await Chat.findById(id)
        if (!chat) {
            throw new Error("Chat not found")
        }
        await Chat.findByIdAndUpdate(chat._id, {
            marked: !chat.marked
        })
        return chat
    } catch (error) {
        throw new Error(error)
    }
}
const deleteMessage = async (id) => {
    try {
        const message = await Message.findById(id)

        if (!message) {
            throw new Error("Message not found")
        }

        // Clean up any files from AWS S3
        if (message.image) {
            await deleteFromS3(message.image);
        }
        if (message.video) {
            await deleteFromS3(message.video);
        }
        if (message.audio) {
            await deleteFromS3(message.audio);
        }

        const data = await Message.findByIdAndDelete(id)
        return {
            message: "Message deleted successfully"
        }
    } catch (error) {
        throw new Error(error)
    }
}
const seenMessage = async (id) => {
    try {
        const chat = await Chat.findById(id)
        if (!chat) {
            throw new Error("Chat not found")
        }
        const seen = await Message.updateMany({
            receiver: chat.owner,
            sender: chat.user,
            seen: { $in: [false, null] }
        }, {
            seen: true
        }, {
            new: true
        })
        return seen
    } catch (error) {
        throw new Error(error)
    }
}
const updateMessage = async (id, data) => {
    try {
        const message = await Message.findByIdAndUpdate(id, data, {
            new: true
        })
        return message
    } catch (error) {
        throw new Error(error)
    }
}
const messageService = {
    createMessage,
    createNewChat,
    getChats,
    chatByUser,
    getAChat,
    getMessages,
    deleteMessage,
    markChat,
    seenMessage,
    getAllMessages,
    updateMessage,
    searchMessages
}

module.exports = messageService