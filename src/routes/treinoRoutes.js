const router = require('express').Router();
const controller = require('../controllers/treinoController');
const asyncHandler = require('../utils/asyncHandler');

router.post('/', asyncHandler(controller.registrar));
router.get('/', asyncHandler(controller.listar));
router.get('/jogador/:id', asyncHandler(controller.porJogador));
router.delete('/:codigo', asyncHandler(controller.excluir));

module.exports = router;
