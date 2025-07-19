import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import net from 'net';

// IP y puerto de tu servidor SSH
const SSH_HOST = '146.235.209.32';
const SSH_PORT = 22;

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('[+] Nueva conexión WebSocket');

  // Conexión TCP al servidor SSH
  const sshSocket = net.connect(SSH_PORT, SSH_HOST, () => {
    console.log('[+] Conectado al servidor SSH');
  });

  // WS ➜ TCP
  ws.on('message', (msg) => {
    if (sshSocket.writable) {
      sshSocket.write(msg);
    }
  });

  // TCP ➜ WS
  sshSocket.on('data', (data) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  });

  // Manejo de cierres
  ws.on('close', () => {
    sshSocket.end();
    console.log('[-] WebSocket cerrado');
  });

  sshSocket.on('close', () => {
    ws.close();
    console.log('[-] Socket TCP cerrado');
  });

  sshSocket.on('error', (err) => {
    console.error('[!] Error en SSH socket:', err.message);
    ws.close();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[✓] Proxy corriendo en puerto ${PORT}`);
});
