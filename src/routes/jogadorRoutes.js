const router = require('express').Router();
const controller = require('../controllers/jogadorController');
const asyncHandler = require('../utils/asyncHandler');

router.post('/', asyncHandler(controller.cadastrar));
router.get('/', asyncHandler(controller.listar));
router.get('/:id', asyncHandler(controller.consultar));
router.put('/:id', asyncHandler(controller.atualizar));
router.patch('/:id/desativar', asyncHandler(controller.desativar));

module.exports = router;
