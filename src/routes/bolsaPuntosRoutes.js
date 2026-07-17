/**
 * routes/bolsaPuntosRoutes.js
 * Rutas HTTP del MODULO 5 (Bolsa de puntos)
 */
const express = require('express');
const router = express.Router();
const controlador = require('../controllers/BolsaPuntosController');

router.post('/', controlador.crear);
router.get('/', controlador.listar);
router.get('/:id', controlador.obtenerPorId);
router.put('/:id', controlador.actualizar);
router.delete('/:id', controlador.eliminar);

module.exports = router;
