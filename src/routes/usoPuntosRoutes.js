/**
 * routes/usoPuntosRoutes.js
 * Rutas HTTP del MODULO 6 (Uso de puntos - consulta de lo ya generado)
 */
const express = require('express');
const router = express.Router();
const controlador = require('../controllers/UsoPuntosController');

router.get('/', controlador.listar);
router.get('/:id', controlador.obtenerPorId);
router.delete('/:id', controlador.eliminar);

module.exports = router;
