const router = require('express').Router();
const controller = require('../controllers/configuracaoController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(controller.consultar));
router.put('/', asyncHandler(controller.atualizar));

module.exports = router;
