const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);

// WebSocket solo en /app53
const wss = new WebSocket.Server({ server, path: '/app53' });

wss.on('connection', (ws) => {
  // No envíes ningún mensaje para que quede en silencio
  ws.on('message', () => {
    // Ignorar cualquier mensaje
  });
});

// Todas las rutas HTTP devuelven 404 sin cuerpo
app.use((req, res) => {
  res.status(404).end(); // sin texto
});

// Ocultar el log de "servidor corriendo"
const PORT = process.env.PORT || 3000;
server.listen(PORT);
