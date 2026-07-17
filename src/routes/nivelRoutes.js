/**
 * routes/nivelRoutes.js
 * Rutas HTTP del MODULO 10 (Niveles de fidelizacion)
 */
const express = require('express');
const router = express.Router();
const controlador = require('../controllers/NivelController');

router.post('/', controlador.crear);
router.get('/', controlador.listar);
router.get('/cliente/:clienteId', controlador.nivelDeCliente);
router.get('/:id', controlador.obtenerPorId);
router.put('/:id', controlador.actualizar);
router.delete('/:id', controlador.eliminar);

module.exports = router;
