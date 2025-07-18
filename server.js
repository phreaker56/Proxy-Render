const http = require('http');
const WebSocket = require('ws');
const net = require('net');

// Verifica que Render o Railway hayan asignado el puerto
const PORT = process.env.PORT;
if (!PORT) {
  console.error('❌ No se detectó el puerto asignado por el host.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>🟢 Proxy está corriendo correctamente.</h1>');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  const sshConnection = net.connect(22, '150.230.38.153'); // IP VPS

  ws.on('message', (message) => sshConnection.write(message));
  sshConnection.on('data', (data) => ws.send(data));
  sshConnection.on('end', () => ws.close());
  ws.on('close', () => sshConnection.end());
  sshConnection.on('error', (err) => {
    console.error('❌ Error en conexión SSH:', err.message);
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

server.listen(PORT, () => {
  console.log(`✅ Proxy activo y escuchando en el puerto ${PORT}`);
});
