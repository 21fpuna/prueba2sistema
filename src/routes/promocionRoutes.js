/**
 * routes/promocionRoutes.js
 * Rutas HTTP del MODULO 12 (Promociones especiales)
 */
const express = require('express');
const router = express.Router();
const controlador = require('../controllers/PromocionController');

router.post('/', controlador.crear);
router.get('/', controlador.listar);
router.get('/vigentes', controlador.listarVigentes);
router.get('/:id', controlador.obtenerPorId);
router.put('/:id', controlador.actualizar);
router.delete('/:id', controlador.eliminar);

module.exports = router;
