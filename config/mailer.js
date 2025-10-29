import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {orderConfirmationTemplate } from "./orderTemplate.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Error al conectar con el servicio de correo:", error);
    } else {
        console.log("📨 Servidor de correo listo para enviar mensajes ✅");
    }
});

// * Envía un email de bienvenida al nuevo usuario
//  * @param {string} to - Email del destinatario
//  * @param {string} name - Nombre del usuario

export async function sendWelcomeEmail(to, name) {
    try {
        const mailOptions = {
            from: `"Vivero El Ceibo 🌿" <${process.env.EMAIL_USER}>`,
            to,
            subject: "¡Bienvenido al Vivero Online El Ceibo! 🌱",
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color:#2e7d32;">¡Hola ${name}!</h2>
            <p>Gracias por registrarte en nuestro <strong>Vivero El Ceibo</strong>.</p>
            <p>A partir de ahora vas a poder explorar nuestras plantas, hacer pedidos y dejar reseñas.</p>
            <br/>
            <p>🌿 <em>El equipo del Vivero</em></p>
        </div>`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de bienvenida enviado a ${to}`);
    } catch (error) {
        console.error("❌ Error al enviar correo:", error.message);
    }
}


export async function sendOrderConfirmation(to, name, order) {
  try {
    const mailOptions = {
      from: `"Vivero Online 🌿" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Confirmación de tu pedido #${order.number_order}`,
      html: orderConfirmationTemplate({
        customerName: name,
        numberOrder: order.number_order,
        date: order.date,
        total: order.total
      }),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmación enviado a ${to}`);
  } catch (error) {
    console.error("❌ Error al enviar email de confirmación:", error.message);
  }
}


/**
 * Envía un correo al administrador cuando se crea un nuevo pedido
 * @param {object} order - Datos del pedido
 * @param {object} customer - Datos del cliente
 */
export async function notifyAdminNewOrder(order, customer) {
  try {
    const mailOptions = {
      from: `"Vivero Online 🌿" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // por defecto al mismo correo del vivero
      subject: `🪴 Nuevo pedido recibido (#${order.number_order})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color:#2e7d32;">Nuevo pedido recibido</h2>
          <p><strong>Cliente:</strong> ${customer.name} (${customer.email})</p>
          <p><strong>ID Pedido:</strong> ${order.number_order}</p>
          <p><strong>Total:</strong> $${order.total}</p>
          <p><strong>Fecha:</strong> ${new Date(order.date).toLocaleString()}</p>
          <br/>
          <p>Ver detalles del pedido en el panel de administración.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Notificación enviada al admin sobre nuevo pedido");
  } catch (error) {
    console.error("❌ Error al notificar al admin:", error.message);
  }
}

// ***Para las reseñas
/**
 * Notifica al admin que un cliente dejó una nueva reseña pendiente
 * @param {object} review - La reseña creada
 * @param {object} customer - El cliente que la creó
 * @param {object} product - Producto al que pertenece la reseña
 */
export async function notifyAdminNewReview(review, customer, product) {
  try {
    const mailOptions = {
      from: `"Vivero Online 🌿" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `📝 Nueva reseña pendiente (#${review.id})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color:#2e7d32;">Nueva reseña pendiente</h2>
          <p><strong>Cliente:</strong> ${customer.name} (${customer.email})</p>
          <p><strong>Producto:</strong> ${product.name}</p>
          <p><strong>Calificación:</strong> ${review.ratings} ⭐</p>
          <p><strong>Comentario:</strong> ${review.comment}</p>
          <p><strong>Fecha:</strong> ${new Date(review.fecha_creacion).toLocaleString()}</p>
          <br/>
          <p>Revisá y aprobá la reseña en el panel de administración.</p>
          <p>🌱 <em>Vivero Online</em></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Notificación de nueva reseña enviada al admin");
  } catch (error) {
    console.error("❌ Error al notificar al admin sobre la reseña:", error.message);
  }
}
