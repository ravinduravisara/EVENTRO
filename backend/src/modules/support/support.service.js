const SupportThread = require('../../models/SupportThread');
const User = require('../../models/User');
const { sendEmail } = require('../../utils/emailer');
const logger = require('../../utils/logger');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const normalizeMessage = (message) => String(message || '').trim().replace(/\s+/g, ' ');

const validatePublicMessage = (email, message) => {
  if (!email) {
    const error = new Error('Email is required');
    error.statusCode = 400;
    throw error;
  }

  if (!EMAIL_REGEX.test(email)) {
    const error = new Error('Enter a valid email address');
    error.statusCode = 400;
    throw error;
  }

  if (!message) {
    const error = new Error('Description is required');
    error.statusCode = 400;
    throw error;
  }

  if (message.length < 10) {
    const error = new Error('Description must be at least 10 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (message.length > 1200) {
    const error = new Error('Description must be 1200 characters or fewer');
    error.statusCode = 400;
    throw error;
  }
};

const getRequesterMeta = async (email) => {
  const user = await User.findOne({ email }).select('firstName lastName email isBanned');

  if (!user) {
    return {
      userId: null,
      requesterStatus: 'guest',
      senderType: 'guest',
      senderName: 'Guest user',
    };
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

  if (user.isBanned) {
    return {
      userId: user._id,
      requesterStatus: 'banned',
      senderType: 'banned-user',
      senderName: fullName || 'Banned user',
    };
  }

  return {
    userId: user._id,
    requesterStatus: 'registered',
    senderType: 'registered-user',
    senderName: fullName || 'Registered user',
  };
};

const mapThread = (thread) => {
  const plain = typeof thread.toObject === 'function' ? thread.toObject() : thread;
  const messages = Array.isArray(plain.messages) ? plain.messages : [];
  const lastMessage = messages.length ? messages[messages.length - 1] : null;

  return {
    _id: plain._id,
    email: plain.email,
    requesterStatus: plain.requesterStatus,
    adminUnreadCount: plain.adminUnreadCount || 0,
    lastMessageAt: plain.lastMessageAt,
    lastMessagePreview: plain.lastMessagePreview || '',
    messages,
    lastMessage,
  };
};

const createPublicMessage = async ({ email, description }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedDescription = normalizeMessage(description);

  validatePublicMessage(normalizedEmail, normalizedDescription);

  const requesterMeta = await getRequesterMeta(normalizedEmail);
  const createdAt = new Date();
  const nextMessage = {
    senderType: requesterMeta.senderType,
    senderName: requesterMeta.senderName,
    senderEmail: normalizedEmail,
    body: normalizedDescription,
    createdAt,
  };

  let thread = await SupportThread.findOne({ email: normalizedEmail });

  if (!thread) {
    thread = new SupportThread({
      email: normalizedEmail,
      user: requesterMeta.userId,
      requesterStatus: requesterMeta.requesterStatus,
      messages: [nextMessage],
      adminUnreadCount: 1,
      lastMessageAt: createdAt,
      lastMessagePreview: normalizedDescription.slice(0, 140),
    });
  } else {
    thread.user = requesterMeta.userId;
    thread.requesterStatus = requesterMeta.requesterStatus;
    thread.messages.push(nextMessage);
    thread.adminUnreadCount += 1;
    thread.lastMessageAt = createdAt;
    thread.lastMessagePreview = normalizedDescription.slice(0, 140);
  }

  await thread.save();

  return {
    message: 'Your message has been sent to the admin.',
    thread: mapThread(thread),
  };
};

const getAdminNotifications = async () => {
  const threads = await SupportThread.find()
    .sort({ lastMessageAt: -1 })
    .limit(12)
    .lean();

  const unreadCount = threads.reduce((sum, thread) => sum + (thread.adminUnreadCount || 0), 0);

  return {
    unreadCount,
    threads: threads.map((thread) => mapThread({
      ...thread,
      messages: Array.isArray(thread.messages) ? thread.messages.slice(-8) : [],
    })),
  };
};

const markThreadRead = async (threadId) => {
  const thread = await SupportThread.findById(threadId);
  if (!thread) {
    const error = new Error('Support thread not found');
    error.statusCode = 404;
    throw error;
  }

  thread.adminUnreadCount = 0;
  await thread.save();

  return {
    message: 'Support thread marked as read',
    thread: mapThread(thread),
  };
};

const buildReplyEmailHtml = ({ message, adminName, email }) => {
  const safeName = email.split('@')[0] || 'there';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0f172a;">
      <div style="background: #0f172a; color: #ffffff; padding: 18px 24px; border-radius: 12px 12px 0 0;">
        <h2 style="margin: 0; font-size: 22px;">Reply from Eventro Admin</h2>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; padding: 24px; background: #ffffff;">
        <p style="margin-top: 0;">Hi ${safeName},</p>
        <p>An Eventro admin replied to your message:</p>
        <div style="margin: 18px 0; padding: 16px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; white-space: pre-wrap;">${message}</div>
        <p style="margin-bottom: 0;">Regards,<br />${adminName}<br />Eventro Admin</p>
      </div>
    </div>
  `;
};

const replyToThread = async (threadId, message, adminUser) => {
  const normalizedMessage = normalizeMessage(message);
  if (!normalizedMessage) {
    const error = new Error('Reply message is required');
    error.statusCode = 400;
    throw error;
  }

  if (normalizedMessage.length > 1200) {
    const error = new Error('Reply message must be 1200 characters or fewer');
    error.statusCode = 400;
    throw error;
  }

  const thread = await SupportThread.findById(threadId);
  if (!thread) {
    const error = new Error('Support thread not found');
    error.statusCode = 404;
    throw error;
  }

  const adminName = `${adminUser?.firstName || ''} ${adminUser?.lastName || ''}`.trim() || adminUser?.email || 'Eventro Admin';
  const createdAt = new Date();
  thread.messages.push({
    senderType: 'admin',
    senderName: adminName,
    senderEmail: adminUser?.email || '',
    body: normalizedMessage,
    createdAt,
  });
  thread.adminUnreadCount = 0;
  thread.lastMessageAt = createdAt;
  thread.lastMessagePreview = normalizedMessage.slice(0, 140);
  await thread.save();

  let emailDelivered = true;
  try {
    await sendEmail({
      to: thread.email,
      subject: 'Eventro admin replied to your message',
      html: buildReplyEmailHtml({ message: normalizedMessage, adminName, email: thread.email }),
    });
  } catch (error) {
    emailDelivered = false;
    logger.error(`Support reply email failed: ${error.message}`);
  }

  return {
    message: emailDelivered
      ? 'Reply emailed to the user successfully'
      : 'Reply saved, but it could not be emailed to the user. Check your email settings.',
    emailDelivered,
    thread: mapThread(thread),
  };
};

module.exports = {
  createPublicMessage,
  getAdminNotifications,
  markThreadRead,
  replyToThread,
};