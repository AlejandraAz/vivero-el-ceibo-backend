export function orderConfirmationTemplate({
  customerName,
  numberOrder,
  date,
  total,
}) {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Confirmación de Pedido</title>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f9f9f9; margin:0; padding:0; }
      .container { max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); padding: 20px; }
      h2 { color: #2e7d32; }
      p { font-size: 16px; line-height: 1.5; }
      .highlight { font-weight: bold; color: #2e7d32; }
      .footer { font-size: 14px; color: #777; margin-top: 20px; text-align: center; }
      .button {
  display: inline-block;
  padding: 10px 20px;
  margin-top: 15px;
  background-color: #2e7d32;
  color: #fff !important;
  text-decoration: none !important;
  border-radius: 5px;
}
.button:hover {
  background-color: #27632a;
  cursor:pointer
}
      .button { display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #2e7d32; color: #fff; text-decoration: none; border-radius: 5px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>¡Gracias por tu compra, ${customerName}! 🌱</h2>
      <p>Tu pedido ha sido recibido correctamente.</p>
      <p><span class="highlight">Número de pedido:</span> ${numberOrder}</p>
      <p><span class="highlight">Fecha:</span> ${new Date(
        date
      ).toLocaleDateString()}</p>
      <p><span class="highlight">Total:</span> $${total}</p>
      <a class="button" href="http://localhost:5173">Ver pedido</a>
      <p class="footer">🌿 El equipo del Vivero Online</p>
    </div>
  </body>
  </html>
  `;
}
