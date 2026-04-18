import { useState, useEffect } from "react";
import TablaProductos from "./components/TablaProductos";
import FormProducto from "./components/FormProducto";
import useProductos from "./hooks/useProductos";

export default function Productos() {
  const { productos, agregar, eliminar, actualizar } = useProductos();

  const [mostrarForm, setMostrarForm] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);

  // 🔍 BUSCADOR
  const [busqueda, setBusqueda] = useState("");

  // 📄 PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const [productosPorPagina, setProductosPorPagina] = useState(5);

  // 🔎 FILTRO
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 📄 LÓGICA PAGINACIÓN
  const indexUltimo = paginaActual * productosPorPagina;
  const indexPrimero = indexUltimo - productosPorPagina;

  const productosPaginados = productosFiltrados.slice(
    indexPrimero,
    indexUltimo
  );

  const totalPaginas = Math.ceil(
    productosFiltrados.length / productosPorPagina
  );

  // 🔁 RESET PAGINA
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, productosPorPagina]);

  const handleNuevo = () => {
    setProductoEditar(null);
    setMostrarForm(true);
  };

  const handleEditar = (producto) => {
    setProductoEditar(producto);
    setMostrarForm(true);
  };

  const handleGuardar = async (data) => {
    if (productoEditar) {
      await actualizar(productoEditar.id, data);
    } else {
      await agregar(data);
    }

    setMostrarForm(false);
    setProductoEditar(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      
      {/* 🔥 HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px"
      }}>
        <h2>📦 Gestión de Productos</h2>

        <button onClick={handleNuevo}>
          ➕ Nuevo Producto
        </button>
      </div>

      {/* 🔍 BUSCADOR + 📊 SELECTOR */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "15px",
        gap: "10px"
      }}>
        <input
          placeholder="🔍 Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            width: "70%"
          }}
        />

        <div>
          <label>Mostrar: </label>
          <select
            value={productosPorPagina}
            onChange={(e) =>
              setProductosPorPagina(Number(e.target.value))
            }
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* 📊 INFO */}
      <p style={{ marginBottom: "10px" }}>
        Mostrando {productosPaginados.length} de{" "}
        {productosFiltrados.length} productos
      </p>

      {/* 📋 TABLA */}
      <TablaProductos
        productos={productosPaginados}
        onEliminar={eliminar}
        onEditar={handleEditar}
      />

      {/* 📄 PAGINACIÓN */}
      <div style={{ marginTop: "15px", textAlign: "center" }}>
        <button
          onClick={() => setPaginaActual(paginaActual - 1)}
          disabled={paginaActual === 1}
        >
          ⬅️ Anterior
        </button>

        <span style={{ margin: "0 10px" }}>
          Página {paginaActual} de {totalPaginas || 1}
        </span>

        <button
          onClick={() => setPaginaActual(paginaActual + 1)}
          disabled={paginaActual === totalPaginas || totalPaginas === 0}
        >
          Siguiente ➡️
        </button>
      </div>

      {/* 🧾 MODAL */}
      {mostrarForm && (
        <FormProducto
          producto={productoEditar}
          onClose={() => setMostrarForm(false)}
          onSave={handleGuardar}
        />
      )}
    </div>
  );
}