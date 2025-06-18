export default async function handler(req, res) {
  const accessToken = "APP_USR-8571918509529689-061801-8c10b98675f51b4dc4ef2a19add22a83-457035567"; // Get this from Mercado Pago dashboard

  const { ticketType, quantity, price } = req.body;

  const preference = {
    items: [{
      title: `Entrada ${ticketType}`,
      quantity: Number(quantity),
      currency_id: "CLP",
      unit_price: Number(price)
    }],
    back_urls: {
      success: "https://organikasessions.com/gracias.html",
      failure: "https://organikasessions.com/error.html"
    },
    auto_return: "approved"
  };

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(preference)
  });

  const data = await response.json();
  res.status(200).json({ id: data.id });
}
