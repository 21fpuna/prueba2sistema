/**
 * routes/canjeRoutes.js
 * Rutas HTTP del MODULO 11 (Canjes realizados). La creacion de un canje
 * se hace via POST /servicios/canjear-producto.
 */
const express = require('express');
const router = express.Router();
const controlador = require('../controllers/CanjeController');

router.get('/', controlador.listar);
router.get('/:id', controlador.obtenerPorId);
router.delete('/:id', controlador.eliminar);

module.exports = router;
