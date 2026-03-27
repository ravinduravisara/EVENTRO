const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sendEventReminderEmail } = require('../utils/eventReminderEmail');

const toDate = (d) => (d ? new Date(d) : null);

const buildTicketUrl = (bookingId) => {
  const base = process.env.FRONTEND_BASE_URL || process.env.FRONTEND_URL || '';
  if (!base) return '';
  return `${base.replace(/\/$/, '')}/bookings/${bookingId}/ticket`;
};

const sendRemindersForWindow = async ({ kind, windowStart, windowEnd }) => {
  const reminderKey = kind === 'oneHour' ? 'oneHour' : 'oneDay';

  const events = await Event.find({
    status: { $in: ['live', 'closed'] },
    date: { $gte: windowStart, $lte: windowEnd },
    [`reminders.${reminderKey}.sentAt`]: null,
  })
    .select('title date location reminders')
    .lean();

  for (const event of events) {
    try {
      const bookings = await Booking.find({ event: event._id, status: 'confirmed' })
        .select('_id user')
        .lean();

      if (!bookings.length) {
        await Event.updateOne(
          { _id: event._id, [`reminders.${reminderKey}.sentAt`]: null },
          { $set: { [`reminders.${reminderKey}.sentAt`]: new Date() } }
        );
        continue;
      }

      const userIds = [...new Set(bookings.map((b) => String(b.user)))];
      const users = await User.find({
        _id: { $in: userIds },
        isBanned: false,
        'preferences.eventReminders': true,
        'preferences.emailNotifications': true,
      })
        .select('firstName email')
        .lean();

      const userById = new Map(users.map((u) => [String(u._id), u]));

      let sentCount = 0;
      for (const booking of bookings) {
        const user = userById.get(String(booking.user));
        if (!user?.email) continue;

        await sendEventReminderEmail({
          to: user.email,
          firstName: user.firstName,
          eventTitle: event.title,
          eventDate: event.date ? new Date(event.date).toLocaleString() : '',
          location: event.location,
          ticketUrl: buildTicketUrl(booking._id),
        });
        sentCount += 1;
      }

      await Event.updateOne(
        { _id: event._id, [`reminders.${reminderKey}.sentAt`]: null },
        { $set: { [`reminders.${reminderKey}.sentAt`]: new Date() } }
      );

      logger.info(`Event reminder (${reminderKey}) sent for event ${event._id}: ${sentCount} emails`);
    } catch (err) {
      logger.error(`Event reminder (${reminderKey}) failed for event ${event._id}: ${err.message}`);
    }
  }
};

const runEventReminderJob = async () => {
  const now = new Date();

  // 1-day reminder window: events occurring between 23h and 25h from now
  const oneDayStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const oneDayEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  // 1-hour reminder window: events occurring between 50m and 70m from now
  const oneHourStart = new Date(now.getTime() + 50 * 60 * 1000);
  const oneHourEnd = new Date(now.getTime() + 70 * 60 * 1000);

  await sendRemindersForWindow({ kind: 'oneDay', windowStart: oneDayStart, windowEnd: oneDayEnd });
  await sendRemindersForWindow({ kind: 'oneHour', windowStart: oneHourStart, windowEnd: oneHourEnd });
};

module.exports = { runEventReminderJob };
