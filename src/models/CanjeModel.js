/**
 * =====================================================================
 *  models/CanjeModel.js
 * =====================================================================
 * Modelo del MODULO 11 (parte 2): Canjes de puntos por productos.
 * Estructura: id, clienteId, productoId, cantidad, puntosUtilizados,
 *             fecha
 *
 * Cada canje descuenta puntos de las bolsas del cliente con el mismo
 * esquema FIFO que el uso de puntos por conceptos.
 * =====================================================================
 */

const BaseModel = require('./BaseModel');

class CanjeModel extends BaseModel {

    constructor() {
        super('canjes');
    }

    /** Devuelve todos los canjes de un cliente */
    obtenerPorCliente(clienteId) {
        return this.obtenerTodos().filter((c) => c.clienteId === Number(clienteId));
    }
}

module.exports = new CanjeModel();
