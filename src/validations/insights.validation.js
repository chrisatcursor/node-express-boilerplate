const Joi = require('joi');

const getReports = {
  query: Joi.object().keys({}),
};

module.exports = {
  getReports,
};
