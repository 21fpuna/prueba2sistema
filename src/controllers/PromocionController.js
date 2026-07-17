/**
 * =====================================================================
 *  controllers/PromocionController.js
 * =====================================================================
 * Controlador del MODULO 12: Promociones especiales.
 * CRUD de promociones + consulta de promociones vigentes.
 *
 * La APLICACION de las promociones ocurre en el servicio
 * "cargar puntos" (ServicioController): si hay promociones vigentes,
 * los puntos base se multiplican por el mayor multiplicador aplicable.
 * =====================================================================
 */

const PromocionModel = require('../models/PromocionModel');
const vista = require('../views/responseView');
const { validarCamposObligatorios, esFechaValida } = require('../utils/validaciones');

const CAMPOS_OBLIGATORIOS = ['descripcion', 'fechaInicio', 'fechaFin', 'multiplicador'];

/** POST /promociones -> crea una promocion */
function crear(req, res) {
    const faltantes = validarCamposObligatorios(req.body, CAMPOS_OBLIGATORIOS);
    if (faltantes.length > 0) {
        return vista.error(res, `Faltan los siguientes campos: ${faltantes.join(', ')}`);
    }
    if (!esFechaValida(req.body.fechaInicio) || !esFechaValida(req.body.fechaFin)) {
        return vista.error(res, 'Las fechas indicadas no son validas');
    }
    const multiplicador = Number(req.body.multiplicador);
    if (!(multiplicador > 0)) {
        return vista.error(res, 'El multiplicador debe ser un numero mayor a 0');
    }

    const nuevaPromocion = PromocionModel.crear({
        descripcion: req.body.descripcion,
        fechaInicio: req.body.fechaInicio,
        fechaFin: req.body.fechaFin,
        multiplicador,
        productoId: req.body.productoId !== undefined && req.body.productoId !== null
            ? Number(req.body.productoId)
            : null,
        activa: req.body.activa !== undefined ? Boolean(req.body.activa) : true
    });
    return vista.exito(res, nuevaPromocion, 'Promocion creada correctamente', 201);
}

/** GET /promociones -> lista todas las promociones */
function listar(req, res) {
    return vista.exito(res, PromocionModel.obtenerTodos());
}

/** GET /promociones/vigentes -> promociones activas y dentro de fecha */
function listarVigentes(req, res) {
    const { productoId } = req.query;
    return vista.exito(res, PromocionModel.obtenerVigentes(new Date(), productoId ?? null));
}

/** GET /promociones/:id -> obtiene una promocion puntual */
function obtenerPorId(req, res) {
    const promocion = PromocionModel.buscarPorId(req.params.id);
    if (!promocion) return vista.error(res, 'Promocion no encontrada', 404);
    return vista.exito(res, promocion);
}

/** PUT /promociones/:id -> actualiza una promocion */
function actualizar(req, res) {
    const promocionActualizada = PromocionModel.actualizar(req.params.id, req.body);
    if (!promocionActualizada) return vista.error(res, 'Promocion no encontrada', 404);
    return vista.exito(res, promocionActualizada, 'Promocion actualizada correctamente');
}

/** DELETE /promociones/:id -> elimina una promocion */
function eliminar(req, res) {
    const seElimino = PromocionModel.eliminar(req.params.id);
    if (!seElimino) return vista.error(res, 'Promocion no encontrada', 404);
    return vista.exito(res, null, 'Promocion eliminada correctamente');
}

module.exports = { crear, listar, listarVigentes, obtenerPorId, actualizar, eliminar };
