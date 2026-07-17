/**
 * =====================================================================
 *  utils/emailService.js
 * =====================================================================
 * Servicio encargado de "enviar" el comprobante por correo electronico
 * cuando un cliente utiliza sus puntos.
 *
 * Para simplificar la implementacion (y no depender de credenciales
 * reales de un servidor SMTP), este servicio SIMULA el envio de un
 * correo: en lugar de conectarse a un servidor de correo real, escribe
 * el contenido del mensaje en un archivo de log (data/emails_enviados.log)
 * y tambien lo muestra por consola.
 *
 * Si se desea enviar correos reales, alcanza con reemplazar el cuerpo
 * de la funcion "enviarComprobante" por una llamada a una libreria
 * como "nodemailer", usando las mismas variables (destinatario, asunto,
 * cuerpo) que ya se arman aqui.
 * =====================================================================
 */

const fs = require('fs');
const path = require('path');

const ARCHIVO_LOG = path.join(__dirname, '..', '..', 'data', 'emails_enviados.log');

/**
 * Envia (simuladamente) un comprobante de uso de puntos al cliente.
 * @param {object} cliente - registro del cliente (debe tener email, nombre, apellido)
 * @param {object} cabeceraUso - cabecera del uso de puntos generado
 * @param {object} concepto - concepto por el cual se usaron los puntos
 */
function enviarComprobante(cliente, cabeceraUso, concepto) {
    const asunto = `Comprobante de uso de puntos - Fidelizacion`;
    const cuerpo = [
        `Estimado/a ${cliente.nombre} ${cliente.apellido},`,
        ``,
        `Le informamos que se realizo un canje de puntos con el siguiente detalle:`,
        `  - Concepto utilizado : ${concepto.descripcion}`,
        `  - Puntos utilizados  : ${cabeceraUso.puntajeUtilizado}`,
        `  - Fecha              : ${cabeceraUso.fecha}`,
        ``,
        `Gracias por su preferencia.`
    ].join('\n');

    const registroLog = `\n----- ${new Date().toISOString()} -----\n` +
        `Para: ${cliente.email}\n` +
        `Asunto: ${asunto}\n` +
        `${cuerpo}\n`;

    // Simula el envio dejando constancia en un archivo de log
    fs.appendFileSync(ARCHIVO_LOG, registroLog, 'utf-8');

    // Tambien se muestra por consola, util durante el desarrollo/pruebas
    console.log('[emailService] Correo simulado enviado a:', cliente.email);

    return { enviado: true, destinatario: cliente.email, asunto };
}

module.exports = { enviarComprobante };
