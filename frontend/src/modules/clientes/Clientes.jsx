import { useState, useEffect } from "react";
import useClientes from "./hooks/useClientes";
import TablaClientes from "./components/TablaClientes";
import FormCliente from "./components/FormCliente";

export default function Clientes() {
  const { clientes, agregarCliente, editarCliente, borrarCliente } = useClientes();

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // 🔍 BUSCADOR
  const [busqueda, setBusqueda] = useState("");

  // 📄 PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const [clientesPorPagina, setClientesPorPagina] = useState(5);

  // 🔎 FILTRO
  const clientesFiltrados = clientes.filter((c) =>
    `${c.nombre} ${c.apellido}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // 📄 LÓGICA PAGINACIÓN
  const indexUltimo = paginaActual * clientesPorPagina;
  const indexPrimero = indexUltimo - clientesPorPagina;

  const clientesPaginados = clientesFiltrados.slice(
    indexPrimero,
    indexUltimo
  );

  const totalPaginas = Math.ceil(
    clientesFiltrados.length / clientesPorPagina
  );

  // 🔁 RESET PAGINA
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, clientesPorPagina]);

  const handleGuardar = (data) => {
    if (clienteSeleccionado) {
      editarCliente(clienteSeleccionado.id, data);
      setClienteSeleccionado(null);
    } else {
      agregarCliente(data);
    }
  };

  return (
    <div className="p-6">

      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">👥 Clientes</h1>
      </div>

      {/* 🔍 BUSCADOR + 📊 SELECTOR */}
      <div className="flex justify-between mb-4 gap-3">
        <input
          placeholder="🔍 Buscar cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border p-2 rounded w-2/3"
        />

        <div>
          <label>Mostrar: </label>
          <select
            value={clientesPorPagina}
            onChange={(e) =>
              setClientesPorPagina(Number(e.target.value))
            }
            className="border p-2 rounded"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* 📊 INFO */}
      <p className="mb-3 text-sm text-gray-600">
        Mostrando {clientesPaginados.length} de {clientesFiltrados.length} clientes
      </p>

      {/* 🧾 FORM */}
      <FormCliente
        onGuardar={handleGuardar}
        clienteSeleccionado={clienteSeleccionado}
      />

      {/* 📋 TABLA */}
      <TablaClientes
        clientes={clientesPaginados}
        onEditar={setClienteSeleccionado}
        onEliminar={borrarCliente}
      />

      {/* 📄 PAGINACIÓN */}
      <div className="mt-4 flex justify-center items-center gap-4">
        <button
          onClick={() => setPaginaActual(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          ⬅️
        </button>

        <span>
          Página {paginaActual} de {totalPaginas || 1}
        </span>

        <button
          onClick={() => setPaginaActual(paginaActual + 1)}
          disabled={paginaActual === totalPaginas || totalPaginas === 0}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          ➡️
        </button>
      </div>

    </div>
  );
}