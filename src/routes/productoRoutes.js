/**
 * routes/productoRoutes.js
 * Rutas HTTP del MODULO 11 (Catalogo de productos canjeables)
 */
const express = require('express');
const router = express.Router();
const controlador = require('../controllers/ProductoController');

router.post('/', controlador.crear);
router.get('/', controlador.listar);
router.get('/:id', controlador.obtenerPorId);
router.put('/:id', controlador.actualizar);
router.delete('/:id', controlador.eliminar);

module.exports = router;
