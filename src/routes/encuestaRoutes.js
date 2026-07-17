/**
 * routes/encuestaRoutes.js
 * Rutas HTTP del MODULO 14 (Encuestas de satisfaccion)
 */
const express = require('express');
const router = express.Router();
const controlador = require('../controllers/EncuestaController');

router.post('/', controlador.crear);
router.get('/', controlador.listar);
router.get('/resumen', controlador.resumen);
router.get('/:id', controlador.obtenerPorId);
router.delete('/:id', controlador.eliminar);

module.exports = router;
