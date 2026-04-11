export default function TablaUsuarios({ usuarios }) {
  return (
    <table className="w-full bg-white rounded-xl shadow">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">Nombre</th>
          <th className="p-3 text-left">Usuario</th>
          <th className="p-3 text-left">Rol</th>
        </tr>
      </thead>

      <tbody>
        {usuarios.map(u => (
          <tr key={u.id} className="border-b">
            <td className="p-3">{u.nombre}</td>
            <td className="p-3">{u.usuario}</td>
            <td className="p-3">{u.rol_id}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}