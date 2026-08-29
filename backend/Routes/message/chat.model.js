
const mongoose = require('mongoose');
const Schema = mongoose.Schema


const ChatSchema = new Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    marked: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

// Chat list pages sort by updatedAt desc; updatedAt is not unique, so _id is the
// tie-break and both belong in the index that serves the cursor.
ChatSchema.index({ owner: 1, updatedAt: -1, _id: -1 });
ChatSchema.index({ owner: 1, marked: 1, updatedAt: -1 });

const Chat = mongoose.model('Chat', ChatSchema);


module.exports = Chat