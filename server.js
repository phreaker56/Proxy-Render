const WebSocket = require('ws');
const net = require('net');
const http = require('http');

const PORT = process.env.PORT || 443;

// Creamos un servidor HTTP
const serverHttp = http.createServer();

// Creamos WebSocket pero sin que escuche directamente
const wss = new WebSocket.Server({ noServer: true });

// Este evento maneja el Upgrade de HTTP a WebSocket
serverHttp.on('upgrade', (req, socket, head) => {
  if (req.url === '/app53') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

serverHttp.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en el puerto ${PORT} (path /app53 habilitado)`);
});

wss.on('connection', (ws, req) => {
  console.log(`🔗 Nueva conexión desde ${req.socket.remoteAddress}`);

  const sshSocket = net.connect({ host: '146.235.209.234', port: 22 }, () => {
    console.log('✅ Conectado a VPS SSH');
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
    console.log('❌ Cliente desconectado');
  });

  sshSocket.on('close', () => {
    ws.close();
    console.log('❌ VPS SSH desconectado');
  });

  ws.on('error', (err) => {
    console.error('⚠️ Error WebSocket:', err.message);
    sshSocket.end();
  });

  sshSocket.on('error', (err) => {
    console.error('⚠️ Error SSH:', err.message);
    ws.close();
  });
});
