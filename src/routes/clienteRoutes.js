/**
 * routes/clienteRoutes.js
 * Define las rutas HTTP del MODULO 1 (Administracion de clientes)
 * y las conecta con su controlador correspondiente.
 */
const express = require('express');
const router = express.Router();
const controlador = require('../controllers/ClienteController');

router.post('/', controlador.crear);          // Crear cliente
router.get('/', controlador.listar);          // Listar todos los clientes
router.get('/:id', controlador.obtenerPorId); // Obtener un cliente por id
router.put('/:id', controlador.actualizar);   // Actualizar un cliente
router.delete('/:id', controlador.eliminar);  // Eliminar un cliente

module.exports = router;
