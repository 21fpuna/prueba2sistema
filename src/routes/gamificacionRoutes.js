/**
 * routes/gamificacionRoutes.js
 * Rutas HTTP del MODULO 13 (Gamificacion): desafios, insignias y ranking
 */
const express = require('express');
const router = express.Router();
const controlador = require('../controllers/GamificacionController');

// Ranking e insignias (calculados automaticamente)
router.get('/ranking', controlador.ranking);
router.get('/insignias/:clienteId', controlador.insigniasDeCliente);

// Desafios: progreso por cliente y reclamo de recompensas
router.get('/desafios/:clienteId', controlador.progresoDesafios);
router.post('/desafios/reclamar', controlador.reclamarDesafio);

module.exports = router;
