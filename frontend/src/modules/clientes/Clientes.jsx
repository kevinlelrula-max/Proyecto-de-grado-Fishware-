import { useState } from "react";
import useClientes from "./hooks/useClientes";
import TablaClientes from "./components/TablaClientes";
import FormCliente from "./components/FormCliente";

export default function Clientes() {
  const { clientes, agregarCliente, editarCliente, borrarCliente } = useClientes();

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

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
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>

      <FormCliente
        onGuardar={handleGuardar}
        clienteSeleccionado={clienteSeleccionado}
      />

      <TablaClientes
        clientes={clientes}
        onEditar={setClienteSeleccionado}
        onEliminar={borrarCliente}
      />
    </div>
  );
}