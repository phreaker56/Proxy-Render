const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const net = require('net');

const app = express();
const server = http.createServer(app);  // Railway levantará esto
const wss = new WebSocket.Server({ server });  // y esto intercepta WebSocket

wss.on('connection', (ws, req) => {
  console.log(`🔗 Conexión WebSocket de ${req.socket.remoteAddress}`);

  const sshSocket = net.connect({ host: '146.235.209.234', port: 22 }, () => {
    console.log(`✅ Conectado al VPS por SSH`);
  });

  ws.on('message', (data) => sshSocket.write(data));
  sshSocket.on('data', (chunk) => ws.readyState === WebSocket.OPEN && ws.send(chunk));
  ws.on('close', () => sshSocket.end());
  sshSocket.on('close', () => ws.close());

  ws.on('error', (err) => { console.error('WebSocket error:', err); sshSocket.end(); });
  sshSocket.on('error', (err) => { console.error('SSH socket error:', err); ws.close(); });
});

// Railway asigna el puerto por env var
const PORT = process.env.PORT || 443;
server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
