/**
 * =====================================================================
 *  models/VencimientoModel.js
 * =====================================================================
 * Modelo del MODULO 4: Parametrizacion de vencimientos de puntos.
 * Estructura: id, fechaInicioValidez, fechaFinValidez, diasDuracion
 *
 * Cada parametro define, para un rango de fechas de vigencia, cuantos
 * dias de vida util van a tener los puntos que se asignen durante ese
 * periodo.
 * =====================================================================
 */

const BaseModel = require('./BaseModel');

class VencimientoModel extends BaseModel {

    constructor() {
        super('vencimientos');
    }

    /**
     * Busca el parametro de vencimiento vigente para una fecha dada
     * (por defecto, hoy). Es decir, aquel donde:
     *   fechaInicioValidez <= fecha <= fechaFinValidez
     */
    buscarVigente(fecha = new Date()) {
        const parametros = this.obtenerTodos();
        const fechaConsulta = new Date(fecha);

        return parametros.find((p) => {
            const inicio = new Date(p.fechaInicioValidez);
            const fin = new Date(p.fechaFinValidez);
            return fechaConsulta >= inicio && fechaConsulta <= fin;
        });
    }
}

module.exports = new VencimientoModel();
