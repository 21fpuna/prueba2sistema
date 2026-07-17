/**
 * =====================================================================
 *  models/NivelModel.js
 * =====================================================================
 * Modelo del MODULO 10: Niveles de fidelizacion.
 * Estructura: id, nombre, puntosMinimos, beneficios
 *
 * Los clientes ascienden de nivel segun el TOTAL HISTORICO de puntos
 * acumulados (la suma de puntajeAsignado de todas sus bolsas, sin
 * importar si luego fueron usados o vencieron). El nivel de un cliente
 * es el de mayor "puntosMinimos" que su acumulado alcanza.
 * =====================================================================
 */

const BaseModel = require('./BaseModel');

class NivelModel extends BaseModel {

    constructor() {
        super('niveles');
    }

    /** Devuelve los niveles ordenados de menor a mayor exigencia */
    obtenerOrdenados() {
        return this.obtenerTodos()
            .sort((a, b) => a.puntosMinimos - b.puntosMinimos);
    }

    /**
     * Determina el nivel que corresponde a una cantidad de puntos
     * acumulados, y tambien el nivel siguiente (o null si es el maximo).
     */
    determinarNivel(puntosAcumulados) {
        const niveles = this.obtenerOrdenados();
        if (niveles.length === 0) return { nivelActual: null, nivelSiguiente: null };

        let nivelActual = null;
        let nivelSiguiente = null;

        for (const nivel of niveles) {
            if (puntosAcumulados >= nivel.puntosMinimos) {
                nivelActual = nivel;
            } else if (!nivelSiguiente) {
                nivelSiguiente = nivel;
            }
        }
        return { nivelActual, nivelSiguiente };
    }
}

module.exports = new NivelModel();
