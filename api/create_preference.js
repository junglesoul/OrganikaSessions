// /api/create_preference.js

import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Parse JSON manually if body is undefined
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
        success: 'https://organika-sessions.vercel.app/gracias.html',
        failure: 'https://organika-sessions.vercel.app/error.html',
        pending: 'https://organika-sessions.vercel.app/pendiente.html',
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

// Utility to parse raw body if needed
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', err => reject(err));
  });
}
