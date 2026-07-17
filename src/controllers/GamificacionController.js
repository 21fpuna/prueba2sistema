/**
 * =====================================================================
 *  controllers/GamificacionController.js
 * =====================================================================
 * Controlador del MODULO 13: Gamificacion.
 *
 *   - Desafios: CRUD + progreso por cliente + reclamo de recompensa
 *   - Insignias: se calculan automaticamente segun la actividad
 *   - Ranking: clientes ordenados por puntos acumulados
 * =====================================================================
 */

const { Desafio, DesafioCompletado } = require('../models/DesafioModel');
const ClienteModel = require('../models/ClienteModel');
const BolsaPuntosModel = require('../models/BolsaPuntosModel');
const CanjeModel = require('../models/CanjeModel');
const { CabeceraUsoPuntos } = require('../models/UsoPuntosModel');
const VencimientoModel = require('../models/VencimientoModel');
const vista = require('../views/responseView');
const { validarCamposObligatorios, sumarDias, formatearFecha } = require('../utils/validaciones');
const { obtenerPuntosAcumulados } = require('../utils/puntosUtils');

const CAMPOS_DESAFIO = ['nombre', 'descripcion', 'metaPuntos', 'puntosRecompensa', 'fechaInicio', 'fechaFin'];

/* ------------------------- CRUD de desafios ------------------------- */

/** POST /desafios -> crea un desafio */
function crearDesafio(req, res) {
    const faltantes = validarCamposObligatorios(req.body, CAMPOS_DESAFIO);
    if (faltantes.length > 0) {
        return vista.error(res, `Faltan los siguientes campos: ${faltantes.join(', ')}`);
    }
    const nuevoDesafio = Desafio.crear({
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        metaPuntos: Number(req.body.metaPuntos),
        puntosRecompensa: Number(req.body.puntosRecompensa),
        fechaInicio: req.body.fechaInicio,
        fechaFin: req.body.fechaFin
    });
    return vista.exito(res, nuevoDesafio, 'Desafio creado correctamente', 201);
}

/** GET /desafios -> lista todos los desafios */
function listarDesafios(req, res) {
    return vista.exito(res, Desafio.obtenerTodos());
}

/** PUT /desafios/:id -> actualiza un desafio */
function actualizarDesafio(req, res) {
    const desafioActualizado = Desafio.actualizar(req.params.id, req.body);
    if (!desafioActualizado) return vista.error(res, 'Desafio no encontrado', 404);
    return vista.exito(res, desafioActualizado, 'Desafio actualizado correctamente');
}

/** DELETE /desafios/:id -> elimina un desafio */
function eliminarDesafio(req, res) {
    const seElimino = Desafio.eliminar(req.params.id);
    if (!seElimino) return vista.error(res, 'Desafio no encontrado', 404);
    return vista.exito(res, null, 'Desafio eliminado correctamente');
}

/* ------------------ Progreso y reclamo de desafios ------------------ */

/**
 * GET /gamificacion/desafios/:clienteId
 * Progreso del cliente en cada desafio vigente (puntos acumulados vs meta).
 */
function progresoDesafios(req, res) {
    const cliente = ClienteModel.buscarPorId(req.params.clienteId);
    if (!cliente) return vista.error(res, 'Cliente no encontrado', 404);

    const puntosAcumulados = obtenerPuntosAcumulados(cliente.id);
    const progreso = Desafio.obtenerTodos().map((desafio) => {
        const completado = puntosAcumulados >= desafio.metaPuntos;
        return {
            ...desafio,
            puntosAcumulados,
            porcentaje: Math.min(100, Math.round((puntosAcumulados / desafio.metaPuntos) * 100)),
            completado,
            reclamado: DesafioCompletado.yaReclamado(cliente.id, desafio.id)
        };
    });

    return vista.exito(res, progreso);
}

/**
 * POST /gamificacion/desafios/reclamar
 * body: { clienteId, desafioId }
 * Si el cliente completo el desafio y aun no lo reclamo, se le otorga
 * una bolsa de bonificacion con los puntos de recompensa.
 */
function reclamarDesafio(req, res) {
    const faltantes = validarCamposObligatorios(req.body, ['clienteId', 'desafioId']);
    if (faltantes.length > 0) {
        return vista.error(res, `Faltan los siguientes campos: ${faltantes.join(', ')}`);
    }

    const { clienteId, desafioId } = req.body;
    const cliente = ClienteModel.buscarPorId(clienteId);
    if (!cliente) return vista.error(res, 'Cliente no encontrado', 404);

    const desafio = Desafio.buscarPorId(desafioId);
    if (!desafio) return vista.error(res, 'Desafio no encontrado', 404);

    if (DesafioCompletado.yaReclamado(clienteId, desafioId)) {
        return vista.error(res, 'El cliente ya reclamo la recompensa de este desafio');
    }

    const puntosAcumulados = obtenerPuntosAcumulados(clienteId);
    if (puntosAcumulados < desafio.metaPuntos) {
        return vista.error(res,
            `El desafio aun no esta completo: ${puntosAcumulados}/${desafio.metaPuntos} puntos`);
    }

    // La recompensa se entrega como una bolsa de bonificacion
    const parametroVencimiento = VencimientoModel.buscarVigente(new Date());
    const hoy = new Date();
    const diasValidez = parametroVencimiento ? parametroVencimiento.diasDuracion : 365;

    const bolsaRecompensa = BolsaPuntosModel.crear({
        clienteId: Number(clienteId),
        fechaAsignacion: formatearFecha(hoy),
        fechaCaducidad: formatearFecha(sumarDias(hoy, diasValidez)),
        puntajeAsignado: Number(desafio.puntosRecompensa),
        puntajeUtilizado: 0,
        saldo: Number(desafio.puntosRecompensa),
        montoOperacion: 0,
        estado: 'vigente'
    });

    const reclamo = DesafioCompletado.crear({
        clienteId: Number(clienteId),
        desafioId: Number(desafioId),
        fecha: formatearFecha(hoy)
    });

    return vista.exito(res, {
        reclamo,
        bolsaRecompensa,
        mensaje: `Se otorgaron ${desafio.puntosRecompensa} puntos por completar "${desafio.nombre}"`
    }, 'Recompensa reclamada correctamente', 201);
}

/* ------------------------------ Insignias ------------------------------ */

/**
 * GET /gamificacion/insignias/:clienteId
 * Las insignias se calculan automaticamente segun la actividad del cliente.
 */
function insigniasDeCliente(req, res) {
    const cliente = ClienteModel.buscarPorId(req.params.clienteId);
    if (!cliente) return vista.error(res, 'Cliente no encontrado', 404);

    const bolsas = BolsaPuntosModel.obtenerPorCliente(cliente.id);
    const usos = CabeceraUsoPuntos.obtenerTodos().filter((u) => u.clienteId === cliente.id);
    const canjes = CanjeModel.obtenerPorCliente(cliente.id);
    const puntosAcumulados = obtenerPuntosAcumulados(cliente.id);
    const desafiosReclamados = DesafioCompletado.obtenerPorCliente(cliente.id).length;

    const insignias = [
        {
            codigo: 'primer-paso', nombre: 'Primer Paso',
            descripcion: 'Realizo su primera operacion con puntos',
            obtenida: bolsas.length >= 1
        },
        {
            codigo: 'comprador-frecuente', nombre: 'Comprador Frecuente',
            descripcion: 'Acumulo puntos en 5 o mas operaciones',
            obtenida: bolsas.length >= 5
        },
        {
            codigo: 'canjeador', nombre: 'Canjeador',
            descripcion: 'Realizo al menos un canje o uso de puntos',
            obtenida: (usos.length + canjes.length) >= 1
        },
        {
            codigo: 'desafiante', nombre: 'Desafiante',
            descripcion: 'Completo y reclamo al menos un desafio',
            obtenida: desafiosReclamados >= 1
        },
        {
            codigo: 'leyenda', nombre: 'Leyenda del Programa',
            descripcion: 'Supero los 10.000 puntos acumulados',
            obtenida: puntosAcumulados >= 10000
        }
    ];

    return vista.exito(res, {
        cliente: { id: cliente.id, nombre: cliente.nombre, apellido: cliente.apellido },
        puntosAcumulados,
        insignias,
        totalObtenidas: insignias.filter((i) => i.obtenida).length
    });
}

/* ------------------------------ Ranking ------------------------------ */

/**
 * GET /gamificacion/ranking
 * Clientes ordenados por puntos acumulados (top ?limite=10).
 */
function ranking(req, res) {
    const limite = req.query.limite ? Number(req.query.limite) : 10;

    const tabla = ClienteModel.obtenerTodos()
        .map((cliente) => ({
            clienteId: cliente.id,
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            puntosAcumulados: obtenerPuntosAcumulados(cliente.id)
        }))
        .sort((a, b) => b.puntosAcumulados - a.puntosAcumulados)
        .slice(0, limite)
        .map((fila, indice) => ({ posicion: indice + 1, ...fila }));

    return vista.exito(res, tabla);
}

module.exports = {
    crearDesafio, listarDesafios, actualizarDesafio, eliminarDesafio,
    progresoDesafios, reclamarDesafio, insigniasDeCliente, ranking
};
