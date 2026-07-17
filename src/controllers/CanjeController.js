/**
 * =====================================================================
 *  controllers/CanjeController.js
 * =====================================================================
 * Controlador del MODULO 11 (parte 2): Canje de puntos por productos.
 *
 *   - canjearProducto: descuenta los puntos del producto (esquema FIFO)
 *     y registra el canje. Envia comprobante por email simulado.
 *   - listar / obtenerPorId / eliminar: consulta de canjes realizados.
 * =====================================================================
 */

const CanjeModel = require('../models/CanjeModel');
const ProductoModel = require('../models/ProductoModel');
const ClienteModel = require('../models/ClienteModel');
const emailService = require('../utils/emailService');
const vista = require('../views/responseView');
const { validarCamposObligatorios, formatearFecha } = require('../utils/validaciones');
const { descontarPuntosFIFO, obtenerSaldoDisponible } = require('../utils/puntosUtils');

/**
 * POST /servicios/canjear-producto
 * body: { clienteId, productoId, cantidad (opcional, por defecto 1) }
 */
function canjearProducto(req, res) {
    const faltantes = validarCamposObligatorios(req.body, ['clienteId', 'productoId']);
    if (faltantes.length > 0) {
        return vista.error(res, `Faltan los siguientes campos: ${faltantes.join(', ')}`);
    }

    const { clienteId, productoId } = req.body;
    const cantidad = Number(req.body.cantidad || 1);
    if (cantidad < 1) return vista.error(res, 'La cantidad debe ser al menos 1');

    const cliente = ClienteModel.buscarPorId(clienteId);
    if (!cliente) return vista.error(res, 'Cliente no encontrado', 404);

    const producto = ProductoModel.buscarPorId(productoId);
    if (!producto) return vista.error(res, 'Producto no encontrado', 404);

    const puntosRequeridos = Number(producto.puntosNecesarios) * cantidad;

    // Descuenta las bolsas en orden FIFO (o devuelve error si no alcanza)
    const detalle = descontarPuntosFIFO(clienteId, puntosRequeridos);
    if (detalle === null) {
        const saldo = obtenerSaldoDisponible(clienteId);
        return vista.error(res,
            `El cliente no cuenta con puntos suficientes: tiene ${saldo} y se requieren ${puntosRequeridos}`);
    }

    const nuevoCanje = CanjeModel.crear({
        clienteId: Number(clienteId),
        productoId: Number(productoId),
        cantidad,
        puntosUtilizados: puntosRequeridos,
        fecha: formatearFecha(new Date())
    });

    // Comprobante por email (simulado), reutilizando el servicio existente
    const resultadoEmail = emailService.enviarComprobante(
        cliente,
        { puntajeUtilizado: puntosRequeridos, fecha: nuevoCanje.fecha },
        { descripcion: `Canje de producto: ${producto.nombre} x${cantidad}` }
    );

    return vista.exito(res, {
        canje: nuevoCanje,
        producto: { id: producto.id, nombre: producto.nombre, precio: producto.precio },
        detalleFIFO: detalle,
        email: resultadoEmail
    }, 'Canje realizado correctamente', 201);
}

/** GET /canjes -> lista todos los canjes (opcionalmente ?clienteId=) */
function listar(req, res) {
    const { clienteId } = req.query;
    const canjes = clienteId
        ? CanjeModel.obtenerPorCliente(clienteId)
        : CanjeModel.obtenerTodos();
    return vista.exito(res, canjes);
}

/** GET /canjes/:id -> obtiene un canje puntual */
function obtenerPorId(req, res) {
    const canje = CanjeModel.buscarPorId(req.params.id);
    if (!canje) return vista.error(res, 'Canje no encontrado', 404);
    return vista.exito(res, canje);
}

/** DELETE /canjes/:id -> elimina un registro de canje */
function eliminar(req, res) {
    const seElimino = CanjeModel.eliminar(req.params.id);
    if (!seElimino) return vista.error(res, 'Canje no encontrado', 404);
    return vista.exito(res, null, 'Canje eliminado correctamente');
}

module.exports = { canjearProducto, listar, obtenerPorId, eliminar };
