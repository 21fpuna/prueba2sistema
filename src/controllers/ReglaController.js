/**
 * =====================================================================
 *  controllers/ReglaController.js
 * =====================================================================
 * Controlador del MODULO 3: Administracion de reglas de asignacion de
 * puntos. Cada regla define un rango de monto de consumo y cuantos
 * guaranies equivalen a 1 punto dentro de ese rango.
 *
 * El campo "limiteSuperior" es OPCIONAL: si se omite (o se manda null)
 * significa que la regla no tiene tope maximo.
 * =====================================================================
 */

const ReglaModel = require('../models/ReglaModel');
const vista = require('../views/responseView');
const { validarCamposObligatorios } = require('../utils/validaciones');

const CAMPOS_OBLIGATORIOS = ['limiteInferior', 'montoEquivalencia'];

/** POST /reglas -> crea una nueva regla de asignacion de puntos */
function crear(req, res) {
    const faltantes = validarCamposObligatorios(req.body, CAMPOS_OBLIGATORIOS);
    if (faltantes.length > 0) {
        return vista.error(res, `Faltan los siguientes campos: ${faltantes.join(', ')}`);
    }

    const datos = {
        limiteInferior: Number(req.body.limiteInferior),
        // Si no se envia limiteSuperior, se guarda como null (sin tope)
        limiteSuperior: req.body.limiteSuperior === undefined ? null : req.body.limiteSuperior,
        montoEquivalencia: Number(req.body.montoEquivalencia)
    };

    const nuevaRegla = ReglaModel.crear(datos);
    return vista.exito(res, nuevaRegla, 'Regla creada correctamente', 201);
}

/** GET /reglas -> lista todas las reglas */
function listar(req, res) {
    return vista.exito(res, ReglaModel.obtenerTodos());
}

/** GET /reglas/:id -> obtiene una regla puntual */
function obtenerPorId(req, res) {
    const regla = ReglaModel.buscarPorId(req.params.id);
    if (!regla) return vista.error(res, 'Regla no encontrada', 404);
    return vista.exito(res, regla);
}

/** PUT /reglas/:id -> actualiza una regla */
function actualizar(req, res) {
    const reglaActualizada = ReglaModel.actualizar(req.params.id, req.body);
    if (!reglaActualizada) return vista.error(res, 'Regla no encontrada', 404);
    return vista.exito(res, reglaActualizada, 'Regla actualizada correctamente');
}

/** DELETE /reglas/:id -> elimina una regla */
function eliminar(req, res) {
    const seElimino = ReglaModel.eliminar(req.params.id);
    if (!seElimino) return vista.error(res, 'Regla no encontrada', 404);
    return vista.exito(res, null, 'Regla eliminada correctamente');
}

module.exports = { crear, listar, obtenerPorId, actualizar, eliminar };
