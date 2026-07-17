/**
 * =====================================================================
 *  models/EncuestaModel.js
 * =====================================================================
 * Modelo del MODULO 14: Encuestas de satisfaccion.
 * Estructura: id, clienteId, puntuacion (1 a 5), comentario, fecha
 *
 * Permite recopilar feedback de los clientes sobre el programa de
 * fidelizacion y calcular un resumen (promedio y distribucion) para
 * identificar areas de mejora.
 * =====================================================================
 */

const BaseModel = require('./BaseModel');

class EncuestaModel extends BaseModel {

    constructor() {
        super('encuestas');
    }

    /** Devuelve las encuestas respondidas por un cliente */
    obtenerPorCliente(clienteId) {
        return this.obtenerTodos().filter((e) => e.clienteId === Number(clienteId));
    }

    /** Calcula promedio y distribucion de puntuaciones (1 a 5) */
    calcularResumen() {
        const encuestas = this.obtenerTodos();
        const total = encuestas.length;

        const distribucion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let suma = 0;
        encuestas.forEach((e) => {
            const p = Number(e.puntuacion);
            suma += p;
            if (distribucion[p] !== undefined) distribucion[p]++;
        });

        return {
            totalRespuestas: total,
            promedio: total > 0 ? Math.round((suma / total) * 100) / 100 : 0,
            distribucion
        };
    }
}

module.exports = new EncuestaModel();
