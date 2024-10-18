'use strict';

const express = require('express');
const path = require('path');
const { createServer } = require('http');

const WebSocket = require('ws');

const app = express();
app.use(express.static(path.join(__dirname, '/public')));

const server = createServer(app);
const wss = new WebSocket.Server({ server, path: '/message' });

wss.on('connection', function (ws) {
  const id = setInterval(function () {
    ws.send(JSON.stringify(process.memoryUsage()), function () {
      //
      // Ignorando errores.
      //
    });
  }, 100);
  console.log('Cliente conectado, iniciando intervalo');

  ws.on('close', function () {
    console.log('Deteniendo intervalo del cliente');
    clearInterval(id);
  });
});

server.listen(8080, function () {
  console.log('Escuchando en http://0.0.0.0:8080');
});
