/**
 * Servicio de envío de mensajes vía WhatsApp Cloud API (Meta)
 * Si las credenciales no están presentes en .env, opera en modo de simulación segura.
 */

async function sendMessage(to, message) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  // Limpiar número de teléfono (solo dígitos)
  const cleanPhone = String(to || '').replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 7) {
    throw new Error('Número de teléfono inválido o con formato incorrecto');
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('El mensaje no puede estar vacío');
  }

  // Si no están configuradas las credenciales en .env, retornar simulación exitosa
  if (!token || !phoneId) {
    return {
      ok: true,
      simulado: true,
      mensaje: 'Mensaje simulado correctamente (WhatsApp Cloud API en modo demostración)'
    };
  }

  // Llamada oficial a Meta WhatsApp Cloud API
  const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: message.trim()
      }
    })
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = (data && data.error && data.error.message) || 'Error devuelto por WhatsApp Cloud API';
    throw new Error(errorMsg);
  }

  return {
    ok: true,
    simulado: false,
    data
  };
}

module.exports = {
  sendMessage
};

