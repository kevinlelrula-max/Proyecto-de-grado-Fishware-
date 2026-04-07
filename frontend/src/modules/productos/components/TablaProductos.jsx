import { formatearPrecio } from "../helpers/formatearPrecio";

export default function TablaProductos({ productos, onEliminar, onEditar }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>📦 Lista de Productos</h3>
      </div>

      <div style={styles.wrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Precio</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.thCenter}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {productos.map((p) => (
              <tr key={p.id} style={styles.row}>
                <td style={styles.tdName}>{p.nombre}</td>

                <td style={styles.td}>
                  {formatearPrecio(p.precio)}
                </td>

                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor:
                        p.stock > 100
                          ? "#dcfce7"
                          : p.stock > 20
                          ? "#fef9c3"
                          : "#fee2e2",
                      color:
                        p.stock > 100
                          ? "#166534"
                          : p.stock > 20
                          ? "#854d0e"
                          : "#991b1b",
                    }}
                  >
                    {p.stock}
                  </span>
                </td>

                <td style={styles.tdCenter}>
                  <button
                    style={styles.editBtn}
                    onClick={() => onEditar(p)}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    style={styles.deleteBtn}
                    onClick={() => onEliminar(p.id)}
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginTop: "30px",
  },

  header: {
    marginBottom: "10px",
  },

  title: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0f172a",
  },

  wrapper: {
    borderRadius: "15px",
    overflow: "hidden",
    backgroundColor: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: "16px",
    textAlign: "left",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    backgroundColor: "#f8fafc",
    color: "#64748b",
  },

  thCenter: {
    padding: "16px",
    textAlign: "center",
    fontSize: "13px",
    textTransform: "uppercase",
    backgroundColor: "#f8fafc",
    color: "#64748b",
  },

  row: {
    transition: "all 0.2s",
  },

  td: {
    padding: "16px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "14px",
    color: "#334155",
  },

  tdName: {
    padding: "16px",
    borderBottom: "1px solid #f1f5f9",
    fontWeight: "500",
    color: "#0f172a",
  },

  tdCenter: {
    padding: "16px",
    textAlign: "center",
    borderBottom: "1px solid #f1f5f9",
  },

  badge: {
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
  },

  editBtn: {
    marginRight: "8px",
    padding: "6px 12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#3b82f6",
    color: "white",
    fontSize: "12px",
    fontWeight: "500",
  },

  deleteBtn: {
    padding: "6px 12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "12px",
    fontWeight: "500",
  },
};