const mongoose = require('mongoose');
const Ticket = require('../../src/models/ticket.model');

const ticketOne = {
  _id: mongoose.Types.ObjectId(),
  title: 'Fix authentication timeout',
  status: 'open',
  priority: 'high',
  category: 'bug',
};

const ticketTwo = {
  _id: mongoose.Types.ObjectId(),
  title: 'Build SSO setup flow',
  status: 'in_progress',
  priority: 'critical',
  category: 'feature',
};

const ticketThree = {
  _id: mongoose.Types.ObjectId(),
  title: 'Resolve onboarding issue',
  status: 'resolved',
  priority: 'medium',
  category: 'support',
};

const ticketFour = {
  _id: mongoose.Types.ObjectId(),
  title: 'Refactor cron cleanup script',
  status: 'blocked',
  priority: 'low',
  category: 'task',
};

const ticketFive = {
  _id: mongoose.Types.ObjectId(),
  title: 'Investigate edge cache misses',
  status: 'open',
  priority: 'high',
  category: 'bug',
};

const insertTickets = async (tickets) => {
  await Ticket.insertMany(tickets);
};

module.exports = {
  ticketOne,
  ticketTwo,
  ticketThree,
  ticketFour,
  ticketFive,
  insertTickets,
};
