
const path = require('path');
const express = require('express');
const rutasPrincipales = require('./src/routes/index');
const { iniciarJobDeVencimientos } = require('./src/jobs/vencimientoJob');

const app = express();
const PUERTO = process.env.PORT || 3000;


app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', rutasPrincipales);

app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
    res.status(404).json({ exito: false, mensaje: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
    console.error('[server] Error no controlado:', error);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
});

const { cargarDatosIniciales } = require('./src/utils/datosIniciales');
cargarDatosIniciales();

iniciarJobDeVencimientos();

app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});
