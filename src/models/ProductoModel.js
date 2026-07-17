/**
 * =====================================================================
 *  models/ProductoModel.js
 * =====================================================================
 * Modelo del MODULO 11: Catalogo de productos/servicios canjeables.
 * Estructura: id, nombre, descripcion, precio (Gs.), puntosNecesarios
 *
 * "puntosNecesarios" define la equivalencia entre puntos y valor
 * monetario para el canje: cuantos puntos cuesta canjear ese producto.
 * =====================================================================
 */

const BaseModel = require('./BaseModel');

class ProductoModel extends BaseModel {
    constructor() {
        super('productos');
    }
}

module.exports = new ProductoModel();
