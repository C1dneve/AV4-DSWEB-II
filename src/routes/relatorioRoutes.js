const router = require('express').Router();
const controller = require('../controllers/relatorioController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/semanal', asyncHandler(controller.semanal));

module.exports = router;
