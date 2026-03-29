const express = require("express");
const router = express.Router();

const ctrl = require("./sponsorshipDeals.controller");
const auth = require("../../middleware/auth");
const roleCheck = require("../../middleware/roleCheck");

// Admin/organizer CRUD
router.post("/deals", auth, roleCheck("admin", "organizer"), ctrl.createDeal);
router.get(
  "/deals/event/:eventId",
  auth,
  roleCheck("admin", "organizer"),
  ctrl.listDealsByEvent,
);
router.get(
  "/analytics/revenue",
  auth,
  roleCheck("admin", "organizer"),
  ctrl.getRevenueAnalytics,
);

// Exposure tracking (can be called from public pages too, but keep it authenticated for now)
router.post(
  "/deals/:dealId/exposure",
  auth,
  roleCheck("admin", "organizer"),
  ctrl.addExposure,
);

module.exports = router;
