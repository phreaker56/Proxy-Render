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
    console.error('❌ Error en conexión SSH:', err);
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

// Asegurar que PORT esté definido
const PORT = process.env.PORT;
if (!PORT) {
  console.error('❌ Error: la variable de entorno PORT no está definida.');
  process.exit(1);
}

server.listen(PORT, () => {
  console.log(`✅ Proxy escuchando correctamente en el puerto ${PORT}`);
});
