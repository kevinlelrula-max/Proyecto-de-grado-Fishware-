import { useState } from "react";
import useUsuarios from "./hooks/useUsuarios";
import TablaUsuarios from "./components/TablaUsuarios";
import FormUsuario from "./components/FormUsuario";

export default function Usuarios() {
  const { usuarios, agregarUsuario } = useUsuarios();
  const [mostrarForm, setMostrarForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Usuarios</h2>

        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Nuevo Usuario
        </button>
      </div>

      {mostrarForm && <FormUsuario onGuardar={agregarUsuario} />}

      <TablaUsuarios usuarios={usuarios} />
    </div>
  );
}