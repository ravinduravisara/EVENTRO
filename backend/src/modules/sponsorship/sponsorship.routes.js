const express = require("express");
const router = express.Router();

const sponsorshipController = require("./sponsorship.controller");
const dealsRoutes = require("./sponsorshipDeals.routes");
const auth = require("../../middleware/auth");
const roleCheck = require("../../middleware/roleCheck");

// Public: companies can submit sponsor interest
router.post("/inquiries", sponsorshipController.createInquiry);

// Admin/organizer: review inquiries
router.get(
  "/inquiries",
  auth,
  roleCheck("admin", "organizer"),
  sponsorshipController.listInquiries,
);

// Deals + analytics
router.use("/", dealsRoutes);

module.exports = router;
