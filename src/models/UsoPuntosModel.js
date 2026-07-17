/**
 * =====================================================================
 *  models/UsoPuntosModel.js
 * =====================================================================
 * Modelo del MODULO 6: Uso de puntos (esquema FIFO).
 *
 * Se manejan DOS colecciones relacionadas:
 *   - Cabecera: id, clienteId, puntajeUtilizado, fecha, conceptoId
 *   - Detalle : id, cabeceraId, puntajeUtilizado, bolsaId
 *
 * Una cabecera puede tener varias lineas de detalle porque, al usar el
 * esquema FIFO, puede ser necesario tomar puntos de mas de una bolsa
 * para completar el puntaje solicitado.
 * =====================================================================
 */

const BaseModel = require('./BaseModel');

class CabeceraUsoPuntosModel extends BaseModel {
    constructor() {
        super('usoPuntosCabecera');
    }

    /** Filtra la cabecera de usos segun cliente, concepto y/o fecha (todos opcionales) */
    filtrar({ clienteId, conceptoId, fecha } = {}) {
        return this.obtenerTodos().filter((cab) => {
            if (clienteId && cab.clienteId !== Number(clienteId)) return false;
            if (conceptoId && cab.conceptoId !== Number(conceptoId)) return false;
            if (fecha && cab.fecha !== fecha) return false;
            return true;
        });
    }
}

class DetalleUsoPuntosModel extends BaseModel {
    constructor() {
        super('usoPuntosDetalle');
    }

    /** Devuelve todas las lineas de detalle que pertenecen a una cabecera */
    obtenerPorCabecera(cabeceraId) {
        return this.obtenerTodos().filter((det) => det.cabeceraId === Number(cabeceraId));
    }
}

module.exports = {
    CabeceraUsoPuntos: new CabeceraUsoPuntosModel(),
    DetalleUsoPuntos: new DetalleUsoPuntosModel()
};
