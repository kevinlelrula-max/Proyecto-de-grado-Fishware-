export default function TablaClientes({ clientes, onEditar, onEliminar }) {
  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden mt-4">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Usuario</th>
            <th className="p-3 text-left">Teléfono</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {clientes.map((c) => (
            <tr key={c.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{c.nombre} {c.apellido}</td>
              <td className="p-3">{c.usuario}</td>
              <td className="p-3">{c.telefono}</td>

              <td className="p-3 flex gap-2">
                <button
                  onClick={() => onEditar(c)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  ✏️
                </button>

                <button
                  onClick={() => onEliminar(c.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}