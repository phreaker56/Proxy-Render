const http = require('http');
const WebSocket = require('ws');
const net = require('net');

const server = http.createServer();

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  const sshConnection = net.connect(22, '150.230.38.153'); // IP de tu VPS

  ws.on('message', (message) => {
    sshConnection.write(message);
  });

  sshConnection.on('data', (data) => {
    ws.send(data);
  });

  sshConnection.on('end', () => ws.close());
  ws.on('close', () => sshConnection.end());

  sshConnection.on('error', (err) => {
    console.error('SSH connection error:', err);
    ws.close();
  });
});

server.on('upgrade', (request, socket, head) => {
  if (request.url === '/app53') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log('Proxy escuchando en puerto', PORT);
});
