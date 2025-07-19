import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import net from 'net';

// Puerto que te asigna Railway o por defecto 8080
const PORT = process.env.PORT || 8080;

// Crear servidor HTTP simple que responde con 404 a todo excepto /app53
const server = http.createServer((req, res) => {
  if (req.url === '/app53') {
    // Respuesta normal a GET sin upgrade (no WebSocket)
    res.writeHead(200);
    res.end('WebSocket endpoint for SSH proxy\n');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Crear servidor WebSocket que usa el mismo HTTP server y solo atiende /app53
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, req) => {
  console.log(`🔗 Nueva conexión WebSocket desde ${req.socket.remoteAddress}`);

  // Conectar al VPS SSH
  const sshSocket = net.connect({ host: '146.235.209.234', port: 22 }, () => {
    console.log(`✅ Conectado al servidor SSH`);
  });

  // Enviar datos desde WS a SSH
  ws.on('message', (data) => {
    sshSocket.write(data);
  });

  // Enviar datos desde SSH a WS
  sshSocket.on('data', (chunk) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(chunk);
    }
  });

  // Cierre WS => cerrar SSH
  ws.on('close', () => {
    sshSocket.end();
    console.log('❌ Cliente WebSocket desconectado');
  });

  // Cierre SSH => cerrar WS
  sshSocket.on('close', () => {
    ws.close();
    console.log('❌ SSH desconectado');
  });

  // Manejo de errores
  ws.on('error', (err) => {
    console.error('⚠️ Error WebSocket:', err.message);
    sshSocket.end();
  });
  sshSocket.on('error', (err) => {
    console.error('⚠️ Error SSH:', err.message);
    ws.close();
  });
});

// Interceptar upgrade para WebSocket solo en /app53
server.on('upgrade', (req, socket, head) => {
  if (req.url === '/app53') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

// Iniciar servidor HTTP + WebSocket
server.listen(PORT, () => {
  console.log(`✅ Servidor WebSocket SSH Proxy corriendo en puerto ${PORT}`);
});
