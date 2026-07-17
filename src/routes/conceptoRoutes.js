/**
 * routes/conceptoRoutes.js
 * Rutas HTTP del MODULO 2 (Administracion de conceptos de uso de puntos)
 */
const express = require('express');
const router = express.Router();
const controlador = require('../controllers/ConceptoController');

router.post('/', controlador.crear);
router.get('/', controlador.listar);
router.get('/:id', controlador.obtenerPorId);
router.put('/:id', controlador.actualizar);
router.delete('/:id', controlador.eliminar);

module.exports = router;
