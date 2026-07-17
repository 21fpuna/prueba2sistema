/**
 * routes/vencimientoRoutes.js
 * Rutas HTTP del MODULO 4 (Parametrizacion de vencimientos de puntos)
 */
const express = require('express');
const router = express.Router();
const controlador = require('../controllers/VencimientoController');

router.post('/', controlador.crear);
router.get('/', controlador.listar);
router.get('/:id', controlador.obtenerPorId);
router.put('/:id', controlador.actualizar);
router.delete('/:id', controlador.eliminar);

module.exports = router;
