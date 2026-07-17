/**
 * routes/desafioRoutes.js
 * Rutas HTTP del MODULO 13 (CRUD de desafios de gamificacion)
 */
const express = require('express');
const router = express.Router();
const controlador = require('../controllers/GamificacionController');

router.post('/', controlador.crearDesafio);
router.get('/', controlador.listarDesafios);
router.put('/:id', controlador.actualizarDesafio);
router.delete('/:id', controlador.eliminarDesafio);

module.exports = router;
