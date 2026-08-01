import nodemailer from "nodemailer";

const MENSAJES_ESTADO = {
  confirmado:     { emoji: "✅", titulo: "Tu pedido fue confirmado",        cuerpo: "Ya recibimos tu pedido y lo estamos procesando." },
  en_preparacion: { emoji: "📦", titulo: "Tu pedido está en preparación",   cuerpo: "Estamos preparando tu pedido con cuidado." },
  enviado:        { emoji: "🚚", titulo: "Tu pedido está en camino",         cuerpo: "Tu pedido ya fue despachado y está en camino a tu dirección." },
  entregado:      { emoji: "🎉", titulo: "Tu pedido fue entregado",          cuerpo: "Tu pedido fue entregado exitosamente. ¡Gracias por tu compra!" },
  cancelado:      { emoji: "❌", titulo: "Tu pedido fue cancelado",          cuerpo: "Lamentablemente tu pedido fue cancelado. Contáctanos si tienes dudas." },
};

// ── Transporter — compatible con AWS SES (SMTP) y cualquier proveedor SMTP ──
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || "email-smtp.us-east-1.amazonaws.com",
  port:   parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function enviarEmailRecuperacion(destinatario, nombre, token, baseUrl) {
  const enlace = `${baseUrl}/tienda/resetear-contrasena?token=${token}`;

  await transporter.sendMail({
    from:    `"Merkai" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to:      destinatario,
    subject: "Recupera tu contraseña",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #f8fafc; border-radius: 16px;">
        <h2 style="color: #0f172a; margin-bottom: 8px;">Hola, ${nombre} 👋</h2>
        <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Recibimos una solicitud para restablecer tu contraseña. Si no la hiciste tú, puedes ignorar este correo.
        </p>
        <a href="${enlace}"
           style="display: inline-block; padding: 13px 28px; background-color: #0F6E56;
                  color: white; text-decoration: none; border-radius: 10px;
                  font-size: 15px; font-weight: 700; margin-bottom: 24px;">
          Restablecer contraseña
        </a>
        <p style="color: #94a3b8; font-size: 13px;">
          Este enlace expira en <strong>1 hora</strong>. Si no pediste esto, ignora el correo.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #cbd5e1; font-size: 12px;">Merkai · Sistema de gestión empresarial</p>
      </div>
    `,
  });
}

export async function enviarEmailEstadoPedido({ destinatario, nombre, numeroPedido, estado, empresaNombre }) {
  const info = MENSAJES_ESTADO[estado];
  if (!info) return; // estados sin notificación (pendiente)

  await transporter.sendMail({
    from:    `"${empresaNombre}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to:      destinatario,
    subject: `${info.emoji} Pedido #${numeroPedido} — ${info.titulo}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #f8fafc; border-radius: 16px;">
        <h2 style="color: #0f172a; margin-bottom: 8px;">${info.emoji} Hola, ${nombre}</h2>
        <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          ${info.cuerpo}
        </p>
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px;">NÚMERO DE PEDIDO</p>
          <p style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0;">#${numeroPedido}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #cbd5e1; font-size: 12px;">${empresaNombre} · Powered by Merkai</p>
      </div>
    `,
  });
}
