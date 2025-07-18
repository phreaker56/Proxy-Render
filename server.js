
const http = require('http');
const WebSocket = require('ws');
const net = require('net');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  const sshConnection = net.connect(22, '150.230.38.153'); // IP pública de tu VPS

  ws.on('message', (message) => {
    sshConnection.write(message);
  });

  sshConnection.on('data', (data) => {
    ws.send(data);
  });

  sshConnection.on('end', () => ws.close());
  ws.on('close', () => sshConnection.end());

  sshConnection.on('error', (err) => {
    console.error('Error en conexión SSH:', err);
    ws.close();
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log('Proxy WebSocket a SSH escuchando en puerto', process.env.PORT || 10000);
});
