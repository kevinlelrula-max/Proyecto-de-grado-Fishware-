import { Router } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

const router = Router();

// Códigos temporales: code -> { userId, empresaId, rolId, codeChallenge, redirectUri, expiresAt }
const authCodes = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [code, data] of authCodes) {
    if (data.expiresAt < now) authCodes.delete(code);
  }
}, 5 * 60 * 1000);

function loginPage(params, error = null) {
  const safe = (v) => String(v || "").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Merkai — Autorizar acceso</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',system-ui,sans-serif;background:#080f1e;color:#cbd5e1;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
    .card{background:#0e1929;border:1px solid rgba(255,255,255,0.07);border-radius:12px;width:100%;max-width:380px;overflow:hidden}
    .head{padding:24px 24px 20px;border-bottom:1px solid rgba(255,255,255,0.07);text-align:center}
    .logo{font-size:18px;font-weight:800;color:white;margin-bottom:6px}
    .logo span{color:#00C9A7}
    .subtitle{font-size:12px;color:#4e6280;line-height:1.5}
    .body{padding:24px}
    label{display:block;font-size:11px;font-weight:700;color:#4e6280;margin-bottom:7px;letter-spacing:.05em;text-transform:uppercase}
    input[type=email],input[type=password]{width:100%;padding:11px 13px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:7px;font-size:14px;color:white;outline:none;margin-bottom:16px;transition:border-color .15s}
    input:focus{border-color:#00C9A7}
    .btn{width:100%;padding:12px;background:white;color:#080f1e;border:none;border-radius:7px;font-size:14px;font-weight:700;cursor:pointer;margin-top:4px;transition:background .15s}
    .btn:hover{background:#e2e8f0}
    .error{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;padding:10px 14px;border-radius:7px;font-size:13px;margin-bottom:16px}
    .note{font-size:11px;color:#334155;text-align:center;margin-top:16px}
    .scope-box{background:rgba(0,201,167,0.05);border:1px solid rgba(0,201,167,0.15);border-radius:7px;padding:12px 14px;margin-bottom:16px;font-size:12px;color:#64748b;line-height:1.6}
    .scope-box b{color:#00C9A7}
  </style>
</head>
<body>
  <div class="card">
    <div class="head">
      <div class="logo">Merkai <span>MCP</span></div>
      <div class="subtitle">Claude AI solicita acceso a tus datos de negocio</div>
    </div>
    <div class="body">
      <div class="scope-box">
        <b>Acceso solicitado:</b><br/>
        Ventas · Inventario · Clientes<br/>
        <span style="color:#1e3a5f">Solo lectura — tus datos no se modifican</span>
      </div>
      ${error ? `<div class="error">⚠ ${error}</div>` : ""}
      <form method="POST" action="/oauth/authorize">
        <input type="hidden" name="redirect_uri" value="${safe(params.redirect_uri)}"/>
        <input type="hidden" name="state" value="${safe(params.state)}"/>
        <input type="hidden" name="code_challenge" value="${safe(params.code_challenge)}"/>
        <input type="hidden" name="code_challenge_method" value="${safe(params.code_challenge_method)}"/>
        <input type="hidden" name="client_id" value="${safe(params.client_id)}"/>
        <label>Email</label>
        <input type="email" name="usuario" placeholder="tu@email.com" required autocomplete="email"/>
        <label>Contraseña</label>
        <input type="password" name="contrasena" placeholder="••••••••" required autocomplete="current-password"/>
        <button type="submit" class="btn">Autorizar acceso →</button>
      </form>
      <div class="note">Solo lectura · Acceso revocable en cualquier momento</div>
    </div>
  </div>
</body>
</html>`;
}

// POST /oauth/register — registro dinámico de clientes (RFC 7591)
// Claude.ai llama esto automáticamente para obtener un client_id
router.post("/register", (req, res) => {
  const { redirect_uris, client_name } = req.body;

  // Generamos un client_id único por sesión de registro
  const clientId = `claude-${crypto.randomBytes(8).toString("hex")}`;

  res.status(201).json({
    client_id: clientId,
    client_name: client_name || "Claude AI",
    redirect_uris: redirect_uris || [],
    grant_types: ["authorization_code"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
  });
});

// GET /oauth/authorize — muestra formulario de login
router.get("/authorize", (req, res) => {
  const { response_type, redirect_uri } = req.query;

  if (response_type !== "code") {
    return res.status(400).send("response_type inválido");
  }
  if (!redirect_uri) {
    return res.status(400).send("redirect_uri requerido");
  }

  res.send(loginPage(req.query));
});

// POST /oauth/authorize — procesa login y redirige con code
router.post("/authorize", async (req, res) => {
  const { usuario, contrasena, redirect_uri, state, code_challenge, code_challenge_method, client_id } = req.body;

  if (!redirect_uri) return res.status(400).send("redirect_uri requerido");

  const params = { redirect_uri, state, code_challenge, code_challenge_method, client_id };

  try {
    const result = await pool.query(
      `SELECT p.id, p.empresa_id, p.rol_id, p.contrasena
       FROM persona p
       WHERE p.usuario = $1`,
      [usuario]
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(contrasena, user.contrasena))) {
      return res.send(loginPage(params, "Credenciales incorrectas"));
    }

    if (user.rol_id === 4) {
      return res.send(loginPage(params, "Este usuario no tiene acceso a la plataforma"));
    }

    const code = crypto.randomBytes(32).toString("hex");
    authCodes.set(code, {
      userId: user.id,
      empresaId: user.empresa_id,
      rolId: user.rol_id,
      codeChallenge: code_challenge || null,
      codeChallengeMethod: code_challenge_method || "S256",
      redirectUri: redirect_uri,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    const url = new URL(redirect_uri);
    url.searchParams.set("code", code);
    if (state) url.searchParams.set("state", state);

    res.redirect(url.toString());
  } catch (err) {
    console.error("[OAuth] Error en /authorize:", err);
    res.status(500).send("Error interno del servidor");
  }
});

// POST /oauth/token — intercambia code por access_token
router.post("/token", async (req, res) => {
  const { grant_type, code, code_verifier } = req.body;

  if (grant_type !== "authorization_code") {
    return res.status(400).json({ error: "unsupported_grant_type" });
  }
  if (!code) {
    return res.status(400).json({ error: "invalid_request", error_description: "code requerido" });
  }

  const codeData = authCodes.get(code);
  if (!codeData || codeData.expiresAt < Date.now()) {
    return res.status(400).json({ error: "invalid_grant" });
  }

  // Verificación PKCE (S256)
  if (codeData.codeChallenge && code_verifier) {
    const hash = crypto.createHash("sha256").update(code_verifier).digest("base64url");
    if (hash !== codeData.codeChallenge) {
      return res.status(400).json({ error: "invalid_grant", error_description: "PKCE inválido" });
    }
  }

  authCodes.delete(code);

  const token = jwt.sign(
    { id: codeData.userId, empresa_id: codeData.empresaId, rol_id: codeData.rolId },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  res.json({
    access_token: token,
    token_type: "Bearer",
    expires_in: 30 * 24 * 60 * 60,
  });
});

export default router;
