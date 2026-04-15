import { useEffect, useState } from "react";
import { getVentasEmpresa } from "../services/api";

const Ventas = () => {
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getVentasEmpresa(token);

        setVentas(data || []);
      } catch (error) {
        console.error("Error cargando ventas:", error);
      }
    };

    fetchData();
  }, []);

  // 🔥 seguro contra null/undefined
  const totalGeneral = ventas.reduce(
    (acc, v) => acc + (Number(v.total) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Historial de Ventas
      </h1>

      {/* RESUMEN */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex justify-between">
        <p className="text-gray-600">
          Total de ventas: <span className="font-bold">{ventas.length}</span>
        </p>

        <p className="text-gray-600">
          Ingresos:{" "}
          <span className="font-bold text-green-600">
            ${totalGeneral.toLocaleString()}
          </span>
        </p>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left">

          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Método de pago</th>
              <th className="p-3">Total</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>

          <tbody>
            {ventas.length > 0 ? (
              ventas.map(v => (
                <tr
                  key={v.venta_id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-3">
                    {v.cliente || "Sin cliente"}
                  </td>

                  <td className="p-3">
                    {v.fecha
                      ? new Date(v.fecha).toLocaleDateString()
                      : "Sin fecha"}
                  </td>

                  <td className="p-3">
                    {v.metodo_pago || "N/A"}
                  </td>

                  <td className="p-3 font-semibold">
                    ${Number(v.total || 0).toLocaleString()}
                  </td>

                  <td className="p-3">
                    <span className="px-2 py-1 rounded-lg text-sm bg-green-100 text-green-700">
                      Completada
                    </span>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No hay ventas registradas
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default Ventas;