import { useState, useEffect } from "react";

export default function FormProducto({ producto, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    stock: "",
    categoria_id: 1,
  });

  useEffect(() => {
    if (producto) {
      setForm(producto);
    }
  }, [producto]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>
          {producto ? "Editar Producto ✏️" : "Nuevo Producto ➕"}
        </h3>

        <form onSubmit={handleSubmit}>
          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
          />

          <input
            name="precio"
            placeholder="Precio"
            value={form.precio}
            onChange={handleChange}
          />

          <input
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
          />

          <button type="submit">
            Guardar
          </button>

          <button type="button" onClick={onClose}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "300px",
  },
};