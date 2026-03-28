const express = require("express");
const router = express.Router();
const feedbackController = require("./feedback.controller");
const auth = require("../../middleware/auth");
const roleCheck = require("../../middleware/roleCheck");

router.post("/", auth, feedbackController.createFeedback);
router.get("/event/:eventId", feedbackController.getEventFeedback);
router.get("/analytics/:eventId", auth, feedbackController.getEventAnalytics);

// Moderation (admin/organizer)
router.get(
  "/moderation/event/:eventId",
  auth,
  roleCheck("admin", "organizer"),
  feedbackController.getEventFeedbackForModeration,
);
router.patch(
  "/moderation/:feedbackId",
  auth,
  roleCheck("admin", "organizer"),
  feedbackController.moderateFeedback,
);

module.exports = router;
