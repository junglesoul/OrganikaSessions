import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  // ✅ Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://organikasessions.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Respond to preflight
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body || await getRawBody(req);
    const { ticketType, quantity, price } = typeof body === 'string' ? JSON.parse(body) : body;

    const preference = {
      items: [
        {
          title: `Entrada ${ticketType}`,
          quantity: Number(quantity),
          unit_price: Number(price),
          currency_id: 'CLP',
        },
      ],
      back_urls: {
        success: 'https://organikasessions.com/gracias.html',
        failure: 'https://organikasessions.com/error.html',
        pending: 'https://organikasessions.com/pendiente.html',
      },
      auto_return: 'approved',
    };

    const response = await mercadopago.preferences.create(preference);
    return res.status(200).json({ id: response.body.id });
  } catch (error) {
    console.error('Error en create_preference:', error);
    return res.status(500).json({ error: 'Error interno al crear la preferencia' });
  }
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', err => reject(err));
  });
}
