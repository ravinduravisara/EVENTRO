const sponsorshipService = require("./sponsorship.service");

const createInquiry = async (req, res, next) => {
  try {
    const inquiry = await sponsorshipService.createInquiry(req.body);
    res.status(201).json(inquiry);
  } catch (error) {
    next(error);
  }
};

const listInquiries = async (req, res, next) => {
  try {
    const inquiries = await sponsorshipService.listInquiries();
    res.json(inquiries);
  } catch (error) {
    next(error);
  }
};

const approveInquiry = async (req, res, next) => {
  try {
    const updated = await sponsorshipService.approveInquiry({
      inquiryId: req.params.id,
      responseMessage: req.body?.responseMessage,
      adminUser: req.user,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { createInquiry, listInquiries, approveInquiry };
