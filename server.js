const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);

// WebSocket en /app53
const wss = new WebSocket.Server({ server, path: '/app53' });

wss.on('connection', (ws) => {
  ws.on('message', () => {});
});

// 404 para todo lo demás
app.use((req, res) => {
  res.status(404).end();
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT);
