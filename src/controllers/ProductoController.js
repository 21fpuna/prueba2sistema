/**
 * =====================================================================
 *  controllers/ProductoController.js
 * =====================================================================
 * Controlador del MODULO 11: Catalogo de productos/servicios canjeables.
 * CRUD del catalogo. El canje en si se realiza via
 * POST /servicios/canjear-producto (ver CanjeController).
 * =====================================================================
 */

const ProductoModel = require('../models/ProductoModel');
const vista = require('../views/responseView');
const { validarCamposObligatorios } = require('../utils/validaciones');

const CAMPOS_OBLIGATORIOS = ['nombre', 'descripcion', 'precio', 'puntosNecesarios'];

/** POST /productos -> agrega un producto/servicio al catalogo */
function crear(req, res) {
    const faltantes = validarCamposObligatorios(req.body, CAMPOS_OBLIGATORIOS);
    if (faltantes.length > 0) {
        return vista.error(res, `Faltan los siguientes campos: ${faltantes.join(', ')}`);
    }

    const nuevoProducto = ProductoModel.crear({
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        precio: Number(req.body.precio),
        puntosNecesarios: Number(req.body.puntosNecesarios)
    });
    return vista.exito(res, nuevoProducto, 'Producto creado correctamente', 201);
}

/** GET /productos -> lista el catalogo completo */
function listar(req, res) {
    return vista.exito(res, ProductoModel.obtenerTodos());
}

/** GET /productos/:id -> obtiene un producto puntual */
function obtenerPorId(req, res) {
    const producto = ProductoModel.buscarPorId(req.params.id);
    if (!producto) return vista.error(res, 'Producto no encontrado', 404);
    return vista.exito(res, producto);
}

/** PUT /productos/:id -> actualiza un producto */
function actualizar(req, res) {
    const productoActualizado = ProductoModel.actualizar(req.params.id, req.body);
    if (!productoActualizado) return vista.error(res, 'Producto no encontrado', 404);
    return vista.exito(res, productoActualizado, 'Producto actualizado correctamente');
}

/** DELETE /productos/:id -> elimina un producto del catalogo */
function eliminar(req, res) {
    const seElimino = ProductoModel.eliminar(req.params.id);
    if (!seElimino) return vista.error(res, 'Producto no encontrado', 404);
    return vista.exito(res, null, 'Producto eliminado correctamente');
}

module.exports = { crear, listar, obtenerPorId, actualizar, eliminar };
