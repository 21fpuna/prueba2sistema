/**
 * =====================================================================
 *  models/ReglaModel.js
 * =====================================================================
 * Modelo del MODULO 3: Administracion de reglas de asignacion de puntos.
 * Estructura: id, limiteInferior, limiteSuperior (puede ser null = "sin
 * limite superior"), montoEquivalencia (Gs. necesarios para 1 punto).
 *
 * Los rangos son OPCIONALES: si solo existe una regla con
 * limiteInferior = 0 y limiteSuperior = null, esa regla se aplica
 * siempre, sin importar el monto de la operacion.
 * =====================================================================
 */

const BaseModel = require('./BaseModel');

class ReglaModel extends BaseModel {

    constructor() {
        super('reglas');
    }

    /**
     * Busca la regla cuyo rango [limiteInferior, limiteSuperior] contiene
     * el monto indicado. Si limiteSuperior es null, se interpreta como
     * "sin tope maximo".
     */
    buscarReglaAplicable(monto) {
        const reglas = this.obtenerTodos();
        return reglas.find((regla) => {
            const cumpleMinimo = monto >= regla.limiteInferior;
            const cumpleMaximo = (regla.limiteSuperior === null || regla.limiteSuperior === undefined)
                ? true
                : monto <= regla.limiteSuperior;
            return cumpleMinimo && cumpleMaximo;
        });
    }
}

module.exports = new ReglaModel();
