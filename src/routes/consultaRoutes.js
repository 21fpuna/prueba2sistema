/**
 * routes/consultaRoutes.js
 * Rutas HTTP del MODULO 7 (Consultas para reportes)
 */
const express = require('express');
const router = express.Router();
const controlador = require('../controllers/ConsultaController');

router.get('/uso-puntos', controlador.usoDePuntos);
router.get('/bolsa-puntos', controlador.bolsaDePuntos);
router.get('/clientes-por-vencer', controlador.clientesConPuntosAVencer);
router.get('/clientes', controlador.buscarClientes);

module.exports = router;
