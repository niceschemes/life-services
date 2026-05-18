const asyncHandler = require('../../utils/asyncHandler');
const masterService = require('../../services/masterService');

exports.overview = asyncHandler(async (req, res) => {
  const data = await masterService.overview();
  res.json(data);
});

exports.companies = asyncHandler(async (req, res) => {
  const data = await masterService.companies();
  res.json(data);
});
