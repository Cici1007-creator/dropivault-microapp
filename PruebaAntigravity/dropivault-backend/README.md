# DropiVault Backend 🚀

Servidor seguro en **Node.js + Express** para la microapp DropiVault. Gestiona la autenticación con la API de Dropi, mantiene las sesiones en memoria con cookies `httpOnly`, resguarda los tokens en el servidor y procesa notificaciones de WhatsApp.

---

## 📦 1. Instalación de dependencias

Desde la carpeta `dropivault-backend/`:

```bash
cd dropivault-backend
npm install
```

*(Si helmet, express-rate-limit o cookie-parser no estaban instalados previamente, se descargarán automáticamente).*

---

## ⚙️ 2. Configuración de Variables de Entorno

Copia el archivo `.env.example` a `.env` y ajusta los valores necesarios:

```bash
cp .env.example .env
```

Variables disponibles en `.env`:
* `PORT`: Puerto de escucha del servidor (por defecto `3000`).
* `ALLOWED_ORIGIN`: Orígenes permitidos por CORS (ej: `http://localhost:5500` para Live Server).
* `SESSION_SECRET`: Clave secreta para firmar sesiones.
* `DROPI_WHITE_BRAND_ID`: Identificador de marca blanca para la API de Dropi (`df3e6b0bb66ceaadca4f84cbc371fd66e04d20fe51fc414da8d1b84d31d178de`).
* `WHATSAPP_TOKEN`: Token de Meta for Developers (opcional; si está vacío opera en simulación).
* `WHATSAPP_PHONE_ID`: ID del número de WhatsApp en Meta (opcional).

---

## 🏃 3. Ejecución del Servidor

* **Modo desarrollo (con recarga automática):**
  ```bash
  npm run dev
  ```
* **Modo producción:**
  ```bash
  npm start
  ```

El servidor estará activo en `http://localhost:3000`.

---

## 🧪 4. Pruebas de Endpoints con `curl`

### A. Health Check
```bash
curl http://localhost:3000/api/health
```

### B. Iniciar Sesión (Modo Demo / Sin contraseña)
Guarda la cookie de sesión en `cookies.txt`:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{\"email\":\"finanzas@tutienda.co\",\"tienda\":\"Imperio COD\",\"comunidad\":\"Dropi Academy Oficial\",\"paisUrl\":\"https://api.dropi.co\"}"
```

### C. Consultar Órdenes (Requiere la cookie de sesión)
```bash
curl -X GET http://localhost:3000/api/orders \
  -b cookies.txt
```

### D. Enviar Mensaje de WhatsApp (Simulado o real con Meta)
```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"telefono\":\"573001234567\",\"mensaje\":\"Hola Carlos, confirmamos tu entrega.\"}"
```

### E. Cerrar Sesión
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

## 📝 5. Tareas Pendientes (TODOs de Dropi)

1. `// TODO: services/dropi.js`: Reemplazar el endpoint simulado de órdenes con la ruta oficial de Dropi (ej. `GET /api/orders` o `/api/shipments`) una vez que Dropi formalice el acceso a su catálogo de guías.
2. `// TODO: services/dropi.js`: Implementar `getOrderById()` con el endpoint específico de seguimiento por guía si se requiere actualización granular.

