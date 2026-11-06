const fs = require('fs');
const path = require('path');

// Cargar variables de entorno: intenta con 'dotenv' o con parser nativo
try {
  require('dotenv').config();
} catch (e) {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.trim().match(/^([^=]+)=(.*)$/);
      if (match && !match[1].startsWith('#')) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

const dropiService = require('./services/dropi');
const whatsappService = require('./services/whatsapp');
const { createSession, getSession, deleteSession } = require('./services/sessions');

const PORT = process.env.PORT || 3000;
const PAIS_WHITELIST = [
  'https://api.dropi.co',
  'https://api.dropi.mx',
  'https://api.dropi.ec',
  'https://api.dropi.cl',
  'https://api.dropi.pe'
];

let app;

try {
  // Intentar cargar Express y sus middlewares de producción
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const rateLimit = require('express-rate-limit');
  const cookieParser = require('cookie-parser');

  app = express();
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5500')
    .split(',')
    .map(o => o.trim());

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());
  app.use(express.json());

  app.use(cors({
    origin: function (origin, callback) {
      callback(null, true); // Permitir peticiones locales y desde navegadores
    },
    credentials: true
  }));

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: 'Demasiados intentos. Espera 15 minutos.' }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ ok: true, status: 'online', mode: 'express', timestamp: new Date().toISOString() });
  });

  // Login
  app.post('/api/auth/login', loginLimiter, async (req, res) => {
    try {
      const { email, password, token, paisUrl, tienda, comunidad } = req.body;
      const cleanPaisUrl = String(paisUrl || 'https://api.dropi.co').replace(/\/$/, '');

      if (!email || !tienda) {
        return res.status(400).json({ ok: false, error: 'Correo corporativo y nombre de tienda son requeridos' });
      }

      let tokenFinal = token ? String(token).trim() : null;

      if (password && String(password).trim()) {
        const whiteBrandId = process.env.DROPI_WHITE_BRAND_ID || 'df3e6b0bb66ceaadca4f84cbc371fd66e04d20fe51fc414da8d1b84d31d178de';
        try {
          const authData = await dropiService.login(email.trim(), String(password).trim(), cleanPaisUrl, whiteBrandId);
          tokenFinal = authData.token;
        } catch (err) {
          return res.status(401).json({ ok: false, error: err.message || 'Credenciales inválidas en Dropi' });
        }
      } else if (!tokenFinal) {
        return res.status(400).json({ ok: false, error: 'Ingresa tu Token de integración o contraseña de Dropi' });
      }

      const sessionId = createSession({
        token: tokenFinal,
        email: email.trim(),
        tienda: tienda.trim(),
        comunidad: (comunidad || '').trim(),
        paisUrl: cleanPaisUrl
      });

      res.cookie('dropivault_session', sessionId, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json({ ok: true, tienda: tienda.trim(), comunidad: comunidad || 'Dropi' });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message || 'Error en el servidor' });
    }
  });

  // Orders
  app.get('/api/orders', async (req, res) => {
    try {
      const sessionId = req.cookies?.dropivault_session;
      const session = getSession(sessionId);

      if (!session) {
        return res.status(401).json({ ok: false, error: 'Sesión no iniciada o expirada' });
      }

      const orders = await dropiService.getOrders(session.token, session.paisUrl);
      res.json({ ok: true, orders });
    } catch (e) {
      console.error('[Error /api/orders]:', e.message);
      res.status(502).json({ ok: false, error: e.message || 'Error al consultar órdenes en Dropi' });
    }
  });

  // WhatsApp
  app.post('/api/whatsapp/send', async (req, res) => {
    try {
      const { telefono, mensaje } = req.body;
      const result = await whatsappService.sendMessage(telefono, mensaje);
      res.json(result);
    } catch (e) {
      res.status(400).json({ ok: false, error: e.message });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    const sessionId = req.cookies?.dropivault_session;
    if (sessionId) deleteSession(sessionId);
    res.clearCookie('dropivault_session');
    res.json({ ok: true });
  });

  app.listen(PORT, () => {
    console.log(`🚀 DropiVault Backend activo en http://localhost:${PORT} [Express]`);
  });

} catch (err) {
  // Fallback nativo: si express no está instalado, usar servidor http nativo de Node
  console.log(`⚠️ Dependencias npm no detectadas (${err.message}).`);
  console.log(`⚡ Iniciando servidor nativo Node.js sin dependencias en puerto ${PORT}...`);

  const http = require('http');

  const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const parseCookies = (rc) => {
      const list = {};
      if (!rc) return list;
      rc.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
      });
      return list;
    };

    const cookies = parseCookies(req.headers.cookie);

    const sendJson = (status, obj, setCookieHeader) => {
      const headers = { 'Content-Type': 'application/json' };
      if (setCookieHeader) headers['Set-Cookie'] = setCookieHeader;
      res.writeHead(status, headers);
      res.end(JSON.stringify(obj));
    };

    const readBody = () => new Promise(resolve => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
      });
    });

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    try {
      if (pathname === '/api/health' && req.method === 'GET') {
        return sendJson(200, { ok: true, status: 'online', mode: 'native_http', timestamp: new Date().toISOString() });
      }

      if (pathname === '/api/auth/login' && req.method === 'POST') {
        const body = await readBody();
        const { email, password, token, paisUrl, tienda, comunidad } = body;
        const cleanPaisUrl = String(paisUrl || 'https://api.dropi.co').replace(/\/$/, '');

        if (!email || !tienda) {
          return sendJson(400, { ok: false, error: 'Correo corporativo y nombre de tienda requeridos' });
        }

        let tokenFinal = token ? String(token).trim() : null;

        if (password && String(password).trim()) {
          const whiteBrandId = process.env.DROPI_WHITE_BRAND_ID || 'df3e6b0bb66ceaadca4f84cbc371fd66e04d20fe51fc414da8d1b84d31d178de';
          try {
            const authData = await dropiService.login(email.trim(), String(password).trim(), cleanPaisUrl, whiteBrandId);
            tokenFinal = authData.token;
          } catch (err) {
            return sendJson(401, { ok: false, error: err.message || 'Credenciales inválidas en Dropi' });
          }
        } else if (!tokenFinal) {
          return sendJson(400, { ok: false, error: 'Ingresa tu Token de integración o contraseña de Dropi' });
        }

        const sessionId = createSession({
          token: tokenFinal,
          email: email.trim(),
          tienda: tienda.trim(),
          comunidad: (comunidad || '').trim(),
          paisUrl: cleanPaisUrl
        });

        const cookieStr = `dropivault_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
        return sendJson(200, { ok: true, tienda: tienda.trim(), comunidad: comunidad || 'Dropi' }, cookieStr);
      }

      if (pathname === '/api/orders' && req.method === 'GET') {
        const sessionId = cookies.dropivault_session;
        const session = getSession(sessionId);

        if (!session) {
          return sendJson(401, { ok: false, error: 'Sesión no iniciada o expirada' });
        }

        const orders = await dropiService.getOrders(session.token, session.paisUrl);
        return sendJson(200, { ok: true, orders });
      }

      if (pathname === '/api/whatsapp/send' && req.method === 'POST') {
        const body = await readBody();
        const result = await whatsappService.sendMessage(body.telefono, body.mensaje);
        return sendJson(200, result);
      }

      if (pathname === '/api/auth/logout' && req.method === 'POST') {
        const sessionId = cookies.dropivault_session;
        if (sessionId) deleteSession(sessionId);
        const cookieStr = `dropivault_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        return sendJson(200, { ok: true }, cookieStr);
      }

      sendJson(404, { ok: false, error: 'Ruta no encontrada' });
    } catch (error) {
      console.error('[Error Nativo]:', error.message);
      sendJson(500, { ok: false, error: error.message || 'Error interno del servidor' });
    }
  });

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 DropiVault Backend activo en http://localhost:${PORT}`);
    console.log(`⚡ Servidor nativo Node.js listo (cero dependencias externas)`);
    console.log(`📡 Conectado a la API oficial de Dropi`);
    console.log(`=======================================================`);
  });
}
