import { useState } from "react";
import TablaProductos from "./components/TablaProductos";
import FormProducto from "./components/FormProducto";
import useProductos from "./hooks/useProductos";

export default function Productos() {
  const { productos, agregar, eliminar, actualizar } = useProductos();

  const [mostrarForm, setMostrarForm] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);

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
    <div>
      <button onClick={handleNuevo}>
        ➕ Nuevo Producto
      </button>

      <TablaProductos
        productos={productos}
        onEliminar={eliminar}
        onEditar={handleEditar}
      />

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