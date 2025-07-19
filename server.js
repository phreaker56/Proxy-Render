const WebSocket = require('ws');
const net = require('net');

// Usa el puerto proporcionado por la plataforma o por defecto 443
const PORT = process.env.PORT || 443;
const server = new WebSocket.Server({ port: PORT });

console.log(`✅ WebSocket SSH Proxy corriendo en el puerto ${PORT}`);

server.on('connection', function connection(ws, req) {
  console.log(`🔗 Nueva conexión desde ${req.socket.remoteAddress}`);

  // Conexión al VPS SSH
  const sshSocket = net.connect({ host: '146.235.209.234', port: 22 }, () => {
    console.log(`✅ Conectado a SSH del VPS`);
  });

  // Reenvía datos del cliente WebSocket al VPS
  ws.on('message', (data) => {
    sshSocket.write(data);
  });

  // Reenvía datos del VPS al WebSocket del cliente
  sshSocket.on('data', (chunk) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(chunk);
    }
  });

  // Cierre de túnel si el cliente se desconecta
  ws.on('close', () => {
    sshSocket.end();
    console.log(`❌ Cliente WebSocket desconectado`);
  });

  // Cierre de túnel si el servidor SSH se desconecta
  sshSocket.on('close', () => {
    ws.close();
    console.log(`❌ SSH desconectado`);
  });

  // Manejo de errores
  ws.on('error', (err) => {
    console.error(`⚠️ WebSocket error:`, err.message);
    sshSocket.end();
  });

  sshSocket.on('error', (err) => {
    console.error(`⚠️ SSH error:`, err.message);
    ws.close();
  });
});
