const WebSocket = require('ws');
const net = require('net');

const PORT = process.env.PORT || 443;

const server = new WebSocket.Server({ port: PORT });

console.log(`✅ WebSocket SSH Proxy corriendo en el puerto ${PORT}`);

server.on('connection', (ws, req) => {
  console.log(`🔗 Nueva conexión desde ${req.socket.remoteAddress}`);

  // Conectamos a tu VPS SSH en IP y puerto 22
  const sshSocket = net.connect({ host: '146.235.209.234', port: 22 }, () => {
    console.log('✅ Conectado a VPS SSH');
  });

  // De cliente WebSocket al VPS SSH
  ws.on('message', (data) => {
    sshSocket.write(data);
  });

  // De VPS SSH al cliente WebSocket
  sshSocket.on('data', (chunk) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(chunk);
    }
  });

  // Cierre si cliente se desconecta
  ws.on('close', () => {
    sshSocket.end();
    console.log('❌ Cliente desconectado');
  });

  // Cierre si VPS SSH se desconecta
  sshSocket.on('close', () => {
    ws.close();
    console.log('❌ VPS SSH desconectado');
  });

  // Manejo de errores WebSocket
  ws.on('error', (err) => {
    console.error('⚠️ Error WebSocket:', err.message);
    sshSocket.end();
  });

  // Manejo de errores SSH
  sshSocket.on('error', (err) => {
    console.error('⚠️ Error SSH:', err.message);
    ws.close();
  });
});
