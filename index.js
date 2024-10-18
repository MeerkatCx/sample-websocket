'use strict';

const express = require('express');
const path = require('path');
const { createServer } = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(express.static(path.join(__dirname, '/public')));
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = createServer(app);

// WebSocket apuntando a /message
const wss = new WebSocket.Server({ server, path: '/message' });

// Almacén de conexiones de WebSocket por conversación
const conversations = new Map();

wss.on('connection', function (ws, req) {
  const conversationId = new URLSearchParams(req.url.split('?')[1]).get('id');
  if (conversationId) {
    if (!conversations.has(conversationId)) {
      conversations.set(conversationId, new Set());
    }
    conversations.get(conversationId).add(ws);

    ws.on('close', function () {
      conversations.get(conversationId).delete(ws);
      if (conversations.get(conversationId).size === 0) {
        conversations.delete(conversationId);
      }
    });
  }

  ws.on('message', function (message) {
    console.log(`Mensaje recibido en la conversación ${conversationId}: ${message}`);
  });
});

// Endpoint POST /message-iframe
app.post('/message-iframe', (req, res) => {
  const { conversationId } = req.body;

  try {
    const clients = conversations.get(conversationId);
    if (clients) {
      // Enviar mensaje a todos los clientes de la conversación
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(req.body));
        }
      });
      res.status(200).send('Mensaje enviado a los clientes del iframe');
    } else {
      res.status(404).send('Conversación no encontrada');
    }
  } catch (err) {
    console.error('Error: ', err);
    res.status(500).send('Error enviando el mensaje');
  }
});

server.listen(4000, function () {
  console.log('Servidor escuchando en http://0.0.0.0:4000');
});
