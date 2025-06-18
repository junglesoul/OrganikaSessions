// /api/create_preference.js

import mercadopago from 'mercadopago';

// 🔐 Configure Mercado Pago with your access token from environment variable
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Vercel already parses req.body as JSON (unless raw body is used), so we avoid double parsing
    const { ticketType, quantity, price } = req.body;

    if (!ticketType || !quantity || !price) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

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
    console.error('❌ Error en create_preference:', error);
    return res.status(500).json({ error: 'Error interno al crear la preferencia' });
  }
}
