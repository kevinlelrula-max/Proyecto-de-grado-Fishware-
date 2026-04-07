import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginEmpresa } from "../services/api";

export default function LoginEmpresa() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    usuario: "",
    contrasena: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await loginEmpresa(form);

      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("empresa_id", res.empresa_id);
        localStorage.setItem("rol_id", res.rol_id);

        alert("¡Bienvenido a FishWare! 🚀");
        navigate("/dashboard"); 
      } else {
        alert(res.error || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error en el login");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Inicio de Sesión 🏢</h2>
        <p style={styles.subtitle}>Accede con tu usuario administrativo</p>

        <input
          style={styles.input}
          name="usuario"
          placeholder="Usuario (email)"
          onChange={handleChange}
        />
        <input
          style={styles.input}
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          onChange={handleChange}
        />

        <button style={styles.button} onClick={handleLogin}>
          Iniciar Sesión
        </button>

        <p style={styles.footerText}>
          ¿No tienes cuenta?{" "}
          <a href="/registroempresa" style={styles.link}>
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #4ade80, #3b82f6)",
    padding: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "40px 35px",
    borderRadius: "20px",
    width: "400px",
    maxWidth: "100%",
    boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
    textAlign: "center",
    fontFamily: "'Roboto', sans-serif",
  },
  title: {
    fontSize: "26px",
    color: "#0f172a",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "25px",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "15px",
    backgroundColor: "#2563eb",
    color: "white",
    fontSize: "16px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.3s",
  },
  footerText: {
    marginTop: "20px",
    fontSize: "13px",
    color: "#6b7280",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "bold",
  },
};