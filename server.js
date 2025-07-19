const WebSocket = require('ws');
const net = require('net');

const PORT = process.env.PORT || 443;
const server = new WebSocket.Server({ port: PORT });

console.log(`✅ Proxy WebSocket corriendo en puerto ${PORT}`);

server.on('connection', (ws, req) => {
  const hostHeader = req.headers['host'];
  console.log(`Nueva conexión con Host header: ${hostHeader}`);

  // Solo aceptar si el host es el que quieres simular
  if (hostHeader !== 'www.googletagmanager.com') {
    ws.close(1008, 'Host no permitido');
    return;
  }

  const sshSocket = net.connect({ host: '146.235.209.234', port: 22 }, () => {
    console.log('Conectado a VPS SSH');
  });

  ws.on('message', data => sshSocket.write(data));
  sshSocket.on('data', chunk => {
    if (ws.readyState === WebSocket.OPEN) ws.send(chunk);
  });

  ws.on('close', () => sshSocket.end());
  sshSocket.on('close', () => ws.close());

  ws.on('error', err => {
    console.error('Error WS:', err.message);
    sshSocket.end();
  });

  sshSocket.on('error', err => {
    console.error('Error SSH:', err.message);
    ws.close();
  });
});
