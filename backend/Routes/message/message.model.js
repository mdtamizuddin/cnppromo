const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Sender is required'],
        ref: 'User'
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Receiver is required'],
        ref: 'User'
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: [true, 'Chat is required']
    },
    message: {
        type: String,
    },
    image: {
        type: String
    },
    audio: {
        type: String
    },
    video: {
        type: String
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
    },
    reply: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
    seen: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
    },
}, {
    timestamps: true
})

// Conversation history is read as `{sender,receiver} OR {receiver,sender}` sorted by
// _id. Indexing both branches lets Mongo resolve the $or as an indexed SORT_MERGE
// instead of scanning the collection.
schema.index({ sender: 1, receiver: 1, _id: -1 });
schema.index({ receiver: 1, sender: 1, _id: -1 });
// Unread counting and the seen sweep both filter on the recipient.
schema.index({ receiver: 1, seen: 1 });
// Direct per-chat lookups, newest first.
schema.index({ chat: 1, _id: -1 });

const Message = mongoose.model('Message', schema);

module.exports = Message