/**
 * =====================================================================
 *  models/ConceptoModel.js
 * =====================================================================
 * Modelo del MODULO 2: Administracion de conceptos de uso de puntos.
 * Estructura: id, descripcion, puntosRequeridos
 * Ejemplos de concepto: "vale de premio", "vale de descuento", etc.
 * =====================================================================
 */

const BaseModel = require('./BaseModel');

class ConceptoModel extends BaseModel {
    constructor() {
        super('conceptos');
    }
}

module.exports = new ConceptoModel();
