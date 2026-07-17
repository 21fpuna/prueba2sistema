/**
 * =====================================================================
 *  controllers/VencimientoController.js
 * =====================================================================
 * Controlador del MODULO 4: Parametrizacion de vencimientos de puntos.
 * =====================================================================
 */

const VencimientoModel = require('../models/VencimientoModel');
const vista = require('../views/responseView');
const { validarCamposObligatorios, esFechaValida } = require('../utils/validaciones');

const CAMPOS_OBLIGATORIOS = ['fechaInicioValidez', 'fechaFinValidez', 'diasDuracion'];

/** POST /vencimientos -> crea un nuevo parametro de vencimiento */
function crear(req, res) {
    const faltantes = validarCamposObligatorios(req.body, CAMPOS_OBLIGATORIOS);
    if (faltantes.length > 0) {
        return vista.error(res, `Faltan los siguientes campos: ${faltantes.join(', ')}`);
    }
    if (!esFechaValida(req.body.fechaInicioValidez) || !esFechaValida(req.body.fechaFinValidez)) {
        return vista.error(res, 'Las fechas indicadas no son validas');
    }

    const nuevoVencimiento = VencimientoModel.crear(req.body);
    return vista.exito(res, nuevoVencimiento, 'Parametro de vencimiento creado correctamente', 201);
}

/** GET /vencimientos -> lista todos los parametros de vencimiento */
function listar(req, res) {
    return vista.exito(res, VencimientoModel.obtenerTodos());
}

/** GET /vencimientos/:id -> obtiene un parametro puntual */
function obtenerPorId(req, res) {
    const vencimiento = VencimientoModel.buscarPorId(req.params.id);
    if (!vencimiento) return vista.error(res, 'Parametro de vencimiento no encontrado', 404);
    return vista.exito(res, vencimiento);
}

/** PUT /vencimientos/:id -> actualiza un parametro de vencimiento */
function actualizar(req, res) {
    const vencimientoActualizado = VencimientoModel.actualizar(req.params.id, req.body);
    if (!vencimientoActualizado) return vista.error(res, 'Parametro de vencimiento no encontrado', 404);
    return vista.exito(res, vencimientoActualizado, 'Parametro de vencimiento actualizado correctamente');
}

/** DELETE /vencimientos/:id -> elimina un parametro de vencimiento */
function eliminar(req, res) {
    const seElimino = VencimientoModel.eliminar(req.params.id);
    if (!seElimino) return vista.error(res, 'Parametro de vencimiento no encontrado', 404);
    return vista.exito(res, null, 'Parametro de vencimiento eliminado correctamente');
}

module.exports = { crear, listar, obtenerPorId, actualizar, eliminar };
