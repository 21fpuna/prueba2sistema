/**
 * =====================================================================
 *  utils/localStorage.js
 * =====================================================================
 * Este modulo SIMULA el comportamiento del objeto "localStorage" que
 * existe en los navegadores web, pero guardando la informacion en un
 * archivo real dentro del servidor (carpeta /data/localStorage.json).
 *
 * Esto es necesario porque "localStorage" es una API del navegador y
 * NO existe dentro de un proceso backend (Node.js). Para cumplir con
 * el requisito de "persistencia local mediante localStorage" se creo
 * esta pequenia libreria que respeta exactamente los mismos metodos
 * que la API original:
 *
 *      localStorage.getItem(clave)
 *      localStorage.setItem(clave, valor)
 *      localStorage.removeItem(clave)
 *      localStorage.clear()
 *
 * De esta forma, el resto del proyecto (los "Modelos") pueden usar
 * este objeto exactamente igual a como se usaria en el navegador.
 * =====================================================================
 */

const fs = require('fs');
const path = require('path');

// Carpeta y archivo donde se va a guardar toda la informacion del sistema
const CARPETA_DATOS = path.join(__dirname, '..', '..', 'data');
const ARCHIVO_DATOS = path.join(CARPETA_DATOS, 'localStorage.json');

/**
 * Crea la carpeta "data" y el archivo "localStorage.json" si todavia
 * no existen. Se ejecuta antes de cualquier lectura/escritura.
 */
function inicializarAlmacenamiento() {
    if (!fs.existsSync(CARPETA_DATOS)) {
        fs.mkdirSync(CARPETA_DATOS, { recursive: true });
    }
    if (!fs.existsSync(ARCHIVO_DATOS)) {
        fs.writeFileSync(ARCHIVO_DATOS, JSON.stringify({}), 'utf-8');
    }
}

/**
 * Lee el archivo completo de persistencia y lo devuelve como objeto JS.
 */
function leerArchivoCompleto() {
    inicializarAlmacenamiento();
    const contenido = fs.readFileSync(ARCHIVO_DATOS, 'utf-8');
    try {
        return JSON.parse(contenido || '{}');
    } catch (error) {
        // Si el archivo se corrompe, se reinicia vacio para no romper el sistema
        return {};
    }
}

/**
 * Escribe el objeto JS completo dentro del archivo de persistencia.
 */
function escribirArchivoCompleto(objeto) {
    fs.writeFileSync(ARCHIVO_DATOS, JSON.stringify(objeto, null, 2), 'utf-8');
}

// Objeto publico que imita la interfaz oficial de "window.localStorage"
const localStorage = {

    /** Obtiene el valor (siempre string) guardado bajo una clave. Devuelve null si no existe */
    getItem(clave) {
        const almacen = leerArchivoCompleto();
        return Object.prototype.hasOwnProperty.call(almacen, clave) ? almacen[clave] : null;
    },

    /** Guarda un valor (string) asociado a una clave */
    setItem(clave, valor) {
        const almacen = leerArchivoCompleto();
        almacen[clave] = valor;
        escribirArchivoCompleto(almacen);
    },

    /** Elimina una clave puntual del almacenamiento */
    removeItem(clave) {
        const almacen = leerArchivoCompleto();
        delete almacen[clave];
        escribirArchivoCompleto(almacen);
    },

    /** Elimina TODO el contenido almacenado (usar con cuidado) */
    clear() {
        escribirArchivoCompleto({});
    }
};

module.exports = localStorage;
