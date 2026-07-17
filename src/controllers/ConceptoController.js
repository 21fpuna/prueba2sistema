/**
 * =====================================================================
 *  controllers/ConceptoController.js
 * =====================================================================
 * Controlador del MODULO 2: Administracion de conceptos de uso de puntos.
 * =====================================================================
 */

const ConceptoModel = require('../models/ConceptoModel');
const vista = require('../views/responseView');
const { validarCamposObligatorios } = require('../utils/validaciones');

const CAMPOS_OBLIGATORIOS = ['descripcion', 'puntosRequeridos'];

/** POST /conceptos -> crea un nuevo concepto */
function crear(req, res) {
    const faltantes = validarCamposObligatorios(req.body, CAMPOS_OBLIGATORIOS);
    if (faltantes.length > 0) {
        return vista.error(res, `Faltan los siguientes campos: ${faltantes.join(', ')}`);
    }

    const nuevoConcepto = ConceptoModel.crear(req.body);
    return vista.exito(res, nuevoConcepto, 'Concepto creado correctamente', 201);
}

/** GET /conceptos -> lista todos los conceptos */
function listar(req, res) {
    return vista.exito(res, ConceptoModel.obtenerTodos());
}

/** GET /conceptos/:id -> obtiene un concepto puntual */
function obtenerPorId(req, res) {
    const concepto = ConceptoModel.buscarPorId(req.params.id);
    if (!concepto) return vista.error(res, 'Concepto no encontrado', 404);
    return vista.exito(res, concepto);
}

/** PUT /conceptos/:id -> actualiza un concepto */
function actualizar(req, res) {
    const conceptoActualizado = ConceptoModel.actualizar(req.params.id, req.body);
    if (!conceptoActualizado) return vista.error(res, 'Concepto no encontrado', 404);
    return vista.exito(res, conceptoActualizado, 'Concepto actualizado correctamente');
}

/** DELETE /conceptos/:id -> elimina un concepto */
function eliminar(req, res) {
    const seElimino = ConceptoModel.eliminar(req.params.id);
    if (!seElimino) return vista.error(res, 'Concepto no encontrado', 404);
    return vista.exito(res, null, 'Concepto eliminado correctamente');
}

module.exports = { crear, listar, obtenerPorId, actualizar, eliminar };
