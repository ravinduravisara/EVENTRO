const dealsService = require("./sponsorshipDeals.service");

const createDeal = async (req, res, next) => {
  try {
    const deal = await dealsService.createDeal({
      eventId: req.body?.eventId,
      sponsorName: req.body?.sponsorName,
      tier: req.body?.tier,
      amount: req.body?.amount,
      currency: req.body?.currency,
      sponsorMeta: req.body?.sponsorMeta,
      notes: req.body?.notes,
    });
    res.status(201).json(deal);
  } catch (error) {
    next(error);
  }
};

const listDealsByEvent = async (req, res, next) => {
  try {
    const deals = await dealsService.listDealsByEvent(req.params.eventId);
    res.json(deals);
  } catch (error) {
    next(error);
  }
};

const addExposure = async (req, res, next) => {
  try {
    const updated = await dealsService.incrementExposure({
      dealId: req.params.dealId,
      kind: req.body?.kind,
      by: req.body?.by,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const getRevenueAnalytics = async (req, res, next) => {
  try {
    const analytics = await dealsService.getRevenueAnalytics({
      eventId: req.query?.eventId,
    });
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDeal,
  listDealsByEvent,
  addExposure,
  getRevenueAnalytics,
};
