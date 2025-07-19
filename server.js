const WebSocket = require('ws');
const net = require('net');

// Puerto que asigna Railway (variable de entorno) o 443 por defecto
const PORT = process.env.PORT || 443;

const server = new WebSocket.Server({ port: PORT });

console.log(`✅ WebSocket SSH Proxy corriendo en el puerto ${PORT}`);

server.on('connection', (ws, req) => {
  console.log(`🔗 Nueva conexión desde ${req.socket.remoteAddress}`);

  // Conectar a tu VPS SSH (IP y puerto 22)
  const sshSocket = net.connect({ host: '146.235.209.234', port: 22 }, () => {
    console.log(`✅ Conectado al servidor SSH`);
  });

  // Datos que vienen del cliente WebSocket se envían al VPS SSH
  ws.on('message', (data) => {
    sshSocket.write(data);
  });

  // Datos que vienen del VPS SSH se envían al WebSocket del cliente
  sshSocket.on('data', (chunk) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(chunk);
    }
  });

  // Cierre conexión cuando cliente se desconecta
  ws.on('close', () => {
    sshSocket.end();
    console.log(`❌ Cliente desconectado`);
  });

  // Cierre conexión cuando VPS SSH se desconecta
  sshSocket.on('close', () => {
    ws.close();
    console.log(`❌ VPS SSH desconectado`);
  });

  // Manejo de errores
  ws.on('error', (err) => {
    console.error(`⚠️ Error WebSocket:`, err.message);
    sshSocket.end();
  });

  sshSocket.on('error', (err) => {
    console.error(`⚠️ Error SSH:`, err.message);
    ws.close();
  });
});
