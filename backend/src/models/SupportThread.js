const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema(
  {
    senderType: {
      type: String,
      enum: ['guest', 'registered-user', 'banned-user', 'admin'],
      required: true,
    },
    senderName: { type: String, default: '' },
    senderEmail: { type: String, default: '', lowercase: true, trim: true },
    body: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const supportThreadSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    requesterStatus: {
      type: String,
      enum: ['guest', 'registered', 'banned'],
      default: 'guest',
    },
    messages: { type: [supportMessageSchema], default: [] },
    adminUnreadCount: { type: Number, default: 0, min: 0 },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: { type: String, default: '' },
  },
  { timestamps: true }
);

supportThreadSchema.index({ lastMessageAt: -1 });
supportThreadSchema.index({ adminUnreadCount: -1, lastMessageAt: -1 });

module.exports = mongoose.model('SupportThread', supportThreadSchema);