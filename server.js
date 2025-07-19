import express from 'express';
import { createServer } from 'http';
import httpProxy from 'http-proxy';

const { createProxyServer } = httpProxy;

const app = express();
const server = createServer(app);

const proxy = createProxyServer({
  target: {
    host: '146.235.209.32',
    port: 22,
    protocol: 'http:',
  },
  ws: true,
  changeOrigin: true,
});

app.use((req, res) => {
  proxy.web(req, res, {}, err => {
    res.writeHead(502);
    res.end('Proxy error');
  });
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, {}, err => {
    socket.end();
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Proxy SSH corriendo en el puerto ${PORT}`);
});
