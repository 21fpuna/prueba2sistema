/**
 * routes/servicioRoutes.js
 * Rutas HTTP del MODULO 8 (Servicios de negocio)
 */
const express = require('express');
const router = express.Router();
const controlador = require('../controllers/ServicioController');

router.post('/cargar-puntos', controlador.cargarPuntos);
router.post('/utilizar-puntos', controlador.utilizarPuntos);
router.post('/canjear-producto', require('../controllers/CanjeController').canjearProducto);
router.get('/equivalencia', controlador.consultarEquivalencia);

module.exports = router;
