/**
 * =====================================================================
 *  controllers/ServicioController.js
 * =====================================================================
 * Controlador del MODULO 8: Servicios de negocio.
 *   - cargarPuntos: asigna puntos a un cliente en base al monto de una operacion
 *   - utilizarPuntos: descuenta puntos de un cliente (esquema FIFO) y envia comprobante
 *   - consultarEquivalencia: informa cuantos puntos equivalen a un monto dado
 * =====================================================================
 */

const ClienteModel = require('../models/ClienteModel');
const ConceptoModel = require('../models/ConceptoModel');
const ReglaModel = require('../models/ReglaModel');
const VencimientoModel = require('../models/VencimientoModel');
const BolsaPuntosModel = require('../models/BolsaPuntosModel');
const { CabeceraUsoPuntos, DetalleUsoPuntos } = require('../models/UsoPuntosModel');
const emailService = require('../utils/emailService');
const { sumarDias, formatearFecha, validarCamposObligatorios } = require('../utils/validaciones');
const vista = require('../views/responseView');

/**
 * Calcula la cantidad de puntos que corresponden a un monto de operacion,
 * en base a las reglas de asignacion configuradas (MODULO 3).
 * Devuelve null si no existe ninguna regla aplicable para ese monto.
 */
function calcularPuntosPorMonto(monto) {
    const regla = ReglaModel.buscarReglaAplicable(monto);
    if (!regla) return null;
    return Math.floor(monto / regla.montoEquivalencia);
}

/**
 * POST /servicios/cargar-puntos
 * body: { clienteId, monto }
 * Asigna puntos al cliente y genera una nueva bolsa de puntos (MODULO 5).
 */
function cargarPuntos(req, res) {
    const faltantes = validarCamposObligatorios(req.body, ['clienteId', 'monto']);
    if (faltantes.length > 0) {
        return vista.error(res, `Faltan los siguientes campos: ${faltantes.join(', ')}`);
    }

    const { clienteId, monto } = req.body;
    const montoNumerico = Number(monto);

    const cliente = ClienteModel.buscarPorId(clienteId);
    if (!cliente) return vista.error(res, 'Cliente no encontrado', 404);

    const puntosBase = calcularPuntosPorMonto(montoNumerico);
    if (puntosBase === null) {
        return vista.error(res, 'No existe una regla de asignacion de puntos aplicable a ese monto');
    }

    // MODULO 12 (Promociones): si hay promociones vigentes (generales o del
    // producto indicado), se aplica el MAYOR multiplicador disponible.
    const PromocionModel = require('../models/PromocionModel');
    const promocionesVigentes = PromocionModel.obtenerVigentes(new Date(), req.body.productoId ?? null);
    const multiplicador = promocionesVigentes.length > 0
        ? Math.max(...promocionesVigentes.map((p) => Number(p.multiplicador)))
        : 1;
    const puntosAsignados = Math.floor(puntosBase * multiplicador);
    const promocionAplicada = promocionesVigentes.find((p) => Number(p.multiplicador) === multiplicador) || null;

    // Se busca el parametro de vencimiento vigente para calcular la fecha de caducidad
    const parametroVencimiento = VencimientoModel.buscarVigente(new Date());
    if (!parametroVencimiento) {
        return vista.error(res, 'No existe un parametro de vencimiento vigente configurado');
    }

    const hoy = new Date();
    const fechaCaducidad = sumarDias(hoy, parametroVencimiento.diasDuracion);

    const nuevaBolsa = BolsaPuntosModel.crear({
        clienteId: Number(clienteId),
        fechaAsignacion: formatearFecha(hoy),
        fechaCaducidad: formatearFecha(fechaCaducidad),
        puntajeAsignado: puntosAsignados,
        puntajeUtilizado: 0,
        saldo: puntosAsignados,
        montoOperacion: montoNumerico,
        estado: 'vigente'
    });

    return vista.exito(res, {
        ...nuevaBolsa,
        puntosBase,
        promocionAplicada: promocionAplicada
            ? { id: promocionAplicada.id, descripcion: promocionAplicada.descripcion, multiplicador }
            : null
    }, promocionAplicada
        ? `Puntos cargados con promocion "${promocionAplicada.descripcion}" (x${multiplicador})`
        : 'Puntos cargados correctamente', 201);
}

/**
 * POST /servicios/utilizar-puntos
 * body: { clienteId, conceptoId }
 * Descuenta los puntos requeridos por el concepto, usando esquema FIFO
 * (las bolsas mas antiguas se consumen primero). Genera cabecera y
 * detalle de uso de puntos (MODULO 6) y envia un correo comprobante.
 */
function utilizarPuntos(req, res) {
    const faltantes = validarCamposObligatorios(req.body, ['clienteId', 'conceptoId']);
    if (faltantes.length > 0) {
        return vista.error(res, `Faltan los siguientes campos: ${faltantes.join(', ')}`);
    }

    const { clienteId, conceptoId } = req.body;

    const cliente = ClienteModel.buscarPorId(clienteId);
    if (!cliente) return vista.error(res, 'Cliente no encontrado', 404);

    const concepto = ConceptoModel.buscarPorId(conceptoId);
    if (!concepto) return vista.error(res, 'Concepto no encontrado', 404);

    const puntosRequeridos = Number(concepto.puntosRequeridos);

    // Se obtienen las bolsas vigentes del cliente ordenadas FIFO (mas antigua primero)
    const bolsasDisponibles = BolsaPuntosModel.obtenerBolsasFIFO(clienteId);
    const saldoTotalDisponible = bolsasDisponibles.reduce((acumulado, bolsa) => acumulado + bolsa.saldo, 0);

    if (saldoTotalDisponible < puntosRequeridos) {
        return vista.error(res, 'El cliente no cuenta con puntos suficientes para este concepto');
    }

    // Se crea primero la cabecera del uso de puntos
    const nuevaCabecera = CabeceraUsoPuntos.crear({
        clienteId: Number(clienteId),
        puntajeUtilizado: puntosRequeridos,
        fecha: formatearFecha(new Date()),
        conceptoId: Number(conceptoId)
    });

    // Se recorren las bolsas en orden FIFO, descontando de a poco hasta cubrir lo requerido
    let puntosPendientes = puntosRequeridos;
    const detalleGenerado = [];

    for (const bolsa of bolsasDisponibles) {
        if (puntosPendientes <= 0) break;

        const puntosADescontarDeEstaBolsa = Math.min(bolsa.saldo, puntosPendientes);

        // Se actualiza la bolsa de puntos (MODULO 5)
        BolsaPuntosModel.actualizar(bolsa.id, {
            puntajeUtilizado: bolsa.puntajeUtilizado + puntosADescontarDeEstaBolsa,
            saldo: bolsa.saldo - puntosADescontarDeEstaBolsa
        });

        // Se genera la linea de detalle correspondiente
        const lineaDetalle = DetalleUsoPuntos.crear({
            cabeceraId: nuevaCabecera.id,
            puntajeUtilizado: puntosADescontarDeEstaBolsa,
            bolsaId: bolsa.id
        });
        detalleGenerado.push(lineaDetalle);

        puntosPendientes -= puntosADescontarDeEstaBolsa;
    }

    // Se envia el correo electronico comprobante al cliente
    const resultadoEmail = emailService.enviarComprobante(cliente, nuevaCabecera, concepto);

    return vista.exito(res, {
        cabecera: nuevaCabecera,
        detalle: detalleGenerado,
        email: resultadoEmail
    }, 'Puntos utilizados correctamente', 201);
}

/**
 * GET /servicios/equivalencia?monto=250000
 * Servicio informativo: devuelve cuantos puntos equivalen a un monto dado.
 */
function consultarEquivalencia(req, res) {
    const { monto } = req.query;
    if (monto === undefined) {
        return vista.error(res, 'Debe indicar el parametro "monto"');
    }

    const montoNumerico = Number(monto);
    const puntos = calcularPuntosPorMonto(montoNumerico);

    if (puntos === null) {
        return vista.error(res, 'No existe una regla de asignacion de puntos aplicable a ese monto');
    }

    return vista.exito(res, { monto: montoNumerico, puntosEquivalentes: puntos });
}

module.exports = { cargarPuntos, utilizarPuntos, consultarEquivalencia };
