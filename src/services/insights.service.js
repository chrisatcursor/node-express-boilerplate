const { Ticket } = require('../models');

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'blocked'];
const PRIORITY_ORDER = ['low', 'medium', 'high', 'critical'];
const CATEGORY_ORDER = ['bug', 'feature', 'support', 'task'];

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  blocked: 'Blocked',
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const CATEGORY_LABELS = {
  bug: 'Bug',
  feature: 'Feature',
  support: 'Support',
  task: 'Task',
};

const buildCountMap = async (field) => {
  const aggregation = await Ticket.aggregate([
    {
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 },
      },
    },
  ]);

  return aggregation.reduce((memo, item) => {
    memo[item._id] = item.count;
    return memo;
  }, {});
};

const mapCountsToSeries = (order, labels, countsByKey) =>
  order.map((key) => ({
    key,
    label: labels[key],
    value: countsByKey[key] || 0,
  }));

const addPercentages = (series, total) =>
  series.map((item) => ({
    ...item,
    percentage: total > 0 ? Number(((item.value / total) * 100).toFixed(1)) : 0,
  }));

const getInsightsReports = async () => {
  const [statusCounts, priorityCounts, categoryCounts, totalTickets] = await Promise.all([
    buildCountMap('status'),
    buildCountMap('priority'),
    buildCountMap('category'),
    Ticket.countDocuments(),
  ]);

  const statusSeries = mapCountsToSeries(STATUS_ORDER, STATUS_LABELS, statusCounts);
  const prioritySeries = mapCountsToSeries(PRIORITY_ORDER, PRIORITY_LABELS, priorityCounts);
  const categorySeries = mapCountsToSeries(CATEGORY_ORDER, CATEGORY_LABELS, categoryCounts);

  return {
    totalTickets,
    donuts: {
      status: addPercentages(statusSeries, totalTickets),
      priority: addPercentages(prioritySeries, totalTickets),
    },
    horizontalBar: {
      label: 'Tickets by Category',
      data: categorySeries,
    },
  };
};

module.exports = {
  getInsightsReports,
};
