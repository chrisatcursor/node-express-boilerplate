const catchAsync = require('../utils/catchAsync');
const { insightsService } = require('../services');

const getReports = catchAsync(async (req, res) => {
  const reports = await insightsService.getInsightsReports();
  res.send(reports);
});

module.exports = {
  getReports,
};
