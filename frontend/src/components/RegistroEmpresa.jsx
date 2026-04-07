import { useState } from "react";
import { registroEmpresa } from "../services/api";

export default function RegistroEmpresa() {
  const [form, setForm] = useState({
    // Empresa
    nombre: "",
    nit: "",
    email: "",
    telefono: "",

    // Administrador
    admin_nombre: "",
    admin_apellido: "",
    admin_usuario: "",
    admin_contrasena: "",
    admin_telefono: "",
    admin_direccion: "",
    admin_tipo_documento: "Cédula de ciudadanía",
    admin_numero_documento: "",
    admin_rol_id: 1, 
    admin_id_municipio: 11001, 
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegistro = async () => {
    const res = await registroEmpresa(form);
    if (res.id_empresa) {
      alert("Empresa y administrador registrados exitosamente 🚀");
    } else {
      alert(res.error || "Error al registrar");
    }
  };

  if (res.token) {
  localStorage.setItem("token", res.token);
  localStorage.setItem("empresa_id", res.empresa_id);
  navigate("/dashboard"); 
}

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Registro Empresa y Administrador</h2>

        
        <div style={styles.section}>
          <h3 style={styles.subtitle}>Empresa 🏢</h3>
          <input style={styles.input} name="nombre" placeholder="Nombre de la empresa" onChange={handleChange} />
          <input style={styles.input} name="nit" placeholder="NIT" onChange={handleChange} />
          <input style={styles.input} name="email" placeholder="Email" onChange={handleChange} />
          <input style={styles.input} name="telefono" placeholder="Teléfono" onChange={handleChange} />
        </div>

        
        <div style={styles.section}>
          <h3 style={styles.subtitle}>Administrador 👤</h3>
          <input style={styles.input} name="admin_nombre" placeholder="Nombre" onChange={handleChange} />
          <input style={styles.input} name="admin_apellido" placeholder="Apellido" onChange={handleChange} />
          <input style={styles.input} name="admin_usuario" placeholder="Usuario (email)" onChange={handleChange} />
          <input style={styles.input} type="password" name="admin_contrasena" placeholder="Contraseña" onChange={handleChange} />
          <input style={styles.input} name="admin_telefono" placeholder="Teléfono" onChange={handleChange} />
          <input style={styles.input} name="admin_direccion" placeholder="Dirección" onChange={handleChange} />
          <select style={styles.input} name="admin_tipo_documento" onChange={handleChange} value={form.admin_tipo_documento}>
            <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
            <option value="Tarjeta de identidad">Tarjeta de identidad</option>
            <option value="Cédula de extranjería">Cédula de extranjería</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
          <input style={styles.input} name="admin_numero_documento" placeholder="Número de documento" onChange={handleChange} />
          <input style={styles.input} name="admin_id_municipio" placeholder="ID Municipio" type="number" onChange={handleChange} />
        </div>

        <button style={styles.button} onClick={handleRegistro}>
          Registrar Empresa
        </button>
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
    padding: "20px"
  },
  card: {
    backgroundColor: "white",
    padding: "40px 35px",
    borderRadius: "20px",
    width: "450px",
    maxWidth: "100%",
    boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
    textAlign: "center",
    fontFamily: "'Roboto', sans-serif"
  },
  title: {
    marginBottom: "30px",
    fontSize: "26px",
    color: "#0f172a"
  },
  section: {
    marginBottom: "25px",
    textAlign: "left"
  },
  subtitle: {
    marginBottom: "15px",
    fontSize: "18px",
    color: "#111827",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "8px"
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
    boxSizing: "border-box"
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
  }
};