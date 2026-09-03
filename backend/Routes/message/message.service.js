const Chat = require("./chat.model")
const Message = require("./message.model")
const mongoose = require('mongoose')
const fs = require('fs')
const { deleteFromS3 } = require("../../util/s3")
const createMessage = async (data) => {
    try {
        const newMessage = new Message({
            ...data,
            seen: false
        })
        const result = await newMessage.save()
        await Chat.updateMany({
            $or: [
                { owner: data.sender, user: data.receiver },
                { owner: data.receiver, user: data.sender },
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
            await chatToReturn.populate('owner', 'name username active lastActive');
            await chatToReturn.populate('user', 'name username active lastActive');
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
            .populate('owner', 'name username active lastActive')
            .populate('user', 'name username active lastActive')
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
//             .populate('user', 'name username active lastActive')
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

const chatByUser = async (id, query = {}) => {
    try {
        const { cursor, sortby, limit = 40 } = query;
        const parsedLimit = parseInt(limit) || 40;

        const filter = { owner: id };

        if (sortby === "Favourite") {
            filter.marked = true;
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
            .populate('user', 'name username active lastActive')
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

        // Fetch global counts & unseen counts in parallel
        const [totalAll, totalFavourite, unseenSenders, unseenCounts] = await Promise.all([
            Chat.countDocuments({ owner: id }),
            Chat.countDocuments({ owner: id, marked: true }),
            Message.aggregate([
                { $match: { receiver: new mongoose.Types.ObjectId(id), seen: { $in: [false, null] } } },
                { $group: { _id: "$sender" } }
            ]),
            userIds.length > 0 ? Message.aggregate([
                {
                    $match: {
                        receiver: new mongoose.Types.ObjectId(id),
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
            totalUnread: unseenSenders.length
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
        }).populate('sender', 'name username active lastActive')
            .populate('receiver', 'name username active lastActive')
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
            .populate('owner', 'name username active lastActive')
            .populate('user', 'name username active lastActive')
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
            .populate('sender')
            .populate('receiver')
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
        const cursor = query.cursor; // ISO timestamp or message ID string

        if (!sender || !receiver) {
            throw new Error("sender and receiver are required");
        }

        const filter = {
            $or: [
                { sender: sender, receiver: receiver },
                { sender: receiver, receiver: sender },
            ]
        };

        if (cursor) {
            const cursorDate = new Date(cursor);
            if (!isNaN(cursorDate.getTime())) {
                filter.createdAt = { $lt: cursorDate };
            }
        }

        const messages = await Message.find(filter)
            .populate("reply")
            .sort({ createdAt: -1 })
            .limit(limit + 1)
            .lean();

        const hasNextPage = messages.length > limit;
        const sliced = hasNextPage ? messages.slice(0, limit) : messages;

        // Oldest in this slice is the next cursor for older messages
        const nextCursor = hasNextPage && sliced.length > 0
            ? sliced[sliced.length - 1].createdAt
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