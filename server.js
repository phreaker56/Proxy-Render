const WebSocket = require('ws');
const net = require('net');

const PORT = process.env.PORT || 443;
const server = new WebSocket.Server({ port: PORT });

console.log(`✅ WebSocket SSH Proxy corriendo en el puerto ${PORT}`);

server.on('connection', function connection(ws, req) {
  console.log(`🔗 Nueva conexión desde ${req.socket.remoteAddress}`);

  // VPS SSH real
  const sshSocket = net.connect({ host: '146.235.209.234', port: 22 }, () => {
    console.log(`✅ Conectado a SSH del VPS`);
  });

  ws.on('message', (data) => {
    sshSocket.write(data);
  });

  sshSocket.on('data', (chunk) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(chunk);
    }
  });

  ws.on('close', () => {
    sshSocket.end();
    console.log(`❌ Cliente WebSocket desconectado`);
  });

  sshSocket.on('close', () => {
    ws.close();
    console.log(`❌ SSH desconectado`);
  });

  ws.on('error', (err) => {
    console.error(`⚠️ WebSocket error:`, err.message);
    sshSocket.end();
  });

  sshSocket.on('error', (err) => {
    console.error(`⚠️ SSH error:`, err.message);
    ws.close();
  });
});
