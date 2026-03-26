const marketingService = require('./marketing.service');

const sendCampaign = async (req, res, next) => {
  try {
    const result = await marketingService.sendCampaign(req.body || {});
    res.json({
      message: 'Campaign processed',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendCampaign };
