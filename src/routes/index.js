/**
 * =====================================================================
 *  routes/index.js
 * =====================================================================
 * Punto central donde se agrupan TODAS las rutas del sistema, cada una
 * bajo su propio prefijo, y se exponen como un unico router hacia
 * server.js.
 * =====================================================================
 */

const express = require('express');
const router = express.Router();

router.use('/clientes', require('./clienteRoutes'));           // Modulo 1
router.use('/conceptos', require('./conceptoRoutes'));          // Modulo 2
router.use('/reglas', require('./reglaRoutes'));                // Modulo 3
router.use('/vencimientos', require('./vencimientoRoutes'));    // Modulo 4
router.use('/bolsas-puntos', require('./bolsaPuntosRoutes'));   // Modulo 5
router.use('/uso-puntos', require('./usoPuntosRoutes'));        // Modulo 6
router.use('/consultas', require('./consultaRoutes'));          // Modulo 7
router.use('/servicios', require('./servicioRoutes'));          // Modulo 8

// ---- Modulos adicionales del Segundo Final ----
router.use('/niveles', require('./nivelRoutes'));               // Modulo 10: Niveles de fidelizacion
router.use('/productos', require('./productoRoutes'));          // Modulo 11: Catalogo canjeable
router.use('/canjes', require('./canjeRoutes'));                // Modulo 11: Canjes realizados
router.use('/promociones', require('./promocionRoutes'));       // Modulo 12: Promociones
router.use('/desafios', require('./desafioRoutes'));            // Modulo 13: Desafios (CRUD)
router.use('/gamificacion', require('./gamificacionRoutes'));   // Modulo 13: Ranking, insignias, progreso
router.use('/encuestas', require('./encuestaRoutes'));          // Modulo 14: Encuestas de satisfaccion

module.exports = router;
