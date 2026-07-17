/**
 * =====================================================================
 *  jobs/vencimientoJob.js
 * =====================================================================
 * MODULO 9: Proceso planificado.
 *
 * Este proceso se ejecuta automaticamente cada cierta cantidad de
 * horas (configurable) y revisa TODAS las bolsas de puntos vigentes.
 * Si encuentra bolsas cuya fecha de caducidad ya paso, las marca como
 * "vencidas" y descuenta el saldo restante (los puntos se pierden).
 * =====================================================================
 */

const cron = require('node-cron');
const BolsaPuntosModel = require('../models/BolsaPuntosModel');

// Cantidad de horas entre cada ejecucion del proceso (se puede ajustar aca)
const HORAS_ENTRE_EJECUCIONES = 6;

/**
 * Recorre las bolsas de puntos vencidas y actualiza su estado,
 * descontando el saldo restante (los puntos vencidos ya no se pueden usar).
 */
function procesarVencimientos() {
    const bolsasVencidas = BolsaPuntosModel.obtenerBolsasVencidasHoy();

    bolsasVencidas.forEach((bolsa) => {
        BolsaPuntosModel.actualizar(bolsa.id, {
            estado: 'vencido',
            saldo: 0
        });
    });

    console.log(
        `[vencimientoJob] Ejecutado ${new Date().toISOString()} - ` +
        `Bolsas marcadas como vencidas: ${bolsasVencidas.length}`
    );
}

/**
 * Registra la tarea programada usando node-cron.
 * La expresion "0 asterisco/HORAS asterisco asterisco asterisco" significa
 * "ejecutar en el minuto 0, cada N horas, todos los dias".
 */
function iniciarJobDeVencimientos() {
    const expresionCron = `0 */${HORAS_ENTRE_EJECUCIONES} * * *`;

    cron.schedule(expresionCron, procesarVencimientos);

    console.log(
        `[vencimientoJob] Proceso planificado iniciado. Se ejecutara cada ${HORAS_ENTRE_EJECUCIONES} horas.`
    );

    // Tambien se ejecuta una vez al iniciar el servidor, para no esperar
    // hasta la primera hora programada.
    procesarVencimientos();
}

module.exports = { iniciarJobDeVencimientos, procesarVencimientos };
