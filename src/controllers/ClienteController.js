/**
 * =====================================================================
 *  controllers/ClienteController.js
 * =====================================================================
 * Controlador del MODULO 1: Administracion de datos del cliente.
 * Expone las operaciones CRUD (Crear, Leer, Actualizar, Eliminar).
 * =====================================================================
 */

const ClienteModel = require('../models/ClienteModel');
const vista = require('../views/responseView');
const { validarCamposObligatorios, esEmailValido } = require('../utils/validaciones');

const CAMPOS_OBLIGATORIOS = [
    'nombre', 'apellido', 'numeroDocumento', 'tipoDocumento',
    'nacionalidad', 'email', 'telefono', 'fechaNacimiento'
];

/** POST /clientes -> crea un nuevo cliente */
function crear(req, res) {
    const datos = req.body;

    const faltantes = validarCamposObligatorios(datos, CAMPOS_OBLIGATORIOS);
    if (faltantes.length > 0) {
        return vista.error(res, `Faltan los siguientes campos: ${faltantes.join(', ')}`);
    }
    if (!esEmailValido(datos.email)) {
        return vista.error(res, 'El email indicado no tiene un formato valido');
    }

    const nuevoCliente = ClienteModel.crear(datos);
    return vista.exito(res, nuevoCliente, 'Cliente creado correctamente', 201);
}

/** GET /clientes -> devuelve todos los clientes */
function listar(req, res) {
    const clientes = ClienteModel.obtenerTodos();
    return vista.exito(res, clientes);
}

/** GET /clientes/:id -> devuelve un cliente puntual */
function obtenerPorId(req, res) {
    const cliente = ClienteModel.buscarPorId(req.params.id);
    if (!cliente) return vista.error(res, 'Cliente no encontrado', 404);
    return vista.exito(res, cliente);
}

/** PUT /clientes/:id -> actualiza los datos de un cliente */
function actualizar(req, res) {
    if (req.body.email && !esEmailValido(req.body.email)) {
        return vista.error(res, 'El email indicado no tiene un formato valido');
    }

    const clienteActualizado = ClienteModel.actualizar(req.params.id, req.body);
    if (!clienteActualizado) return vista.error(res, 'Cliente no encontrado', 404);

    return vista.exito(res, clienteActualizado, 'Cliente actualizado correctamente');
}

/** DELETE /clientes/:id -> elimina un cliente */
function eliminar(req, res) {
    const seElimino = ClienteModel.eliminar(req.params.id);
    if (!seElimino) return vista.error(res, 'Cliente no encontrado', 404);

    return vista.exito(res, null, 'Cliente eliminado correctamente');
}

module.exports = { crear, listar, obtenerPorId, actualizar, eliminar };
