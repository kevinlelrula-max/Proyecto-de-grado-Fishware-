import { useState, useEffect } from "react";
import EmpresaForm from "./components/EmpresaForm";
import MetodosPago from "./components/MetodosPago";
import TiendaForm from "./components/TiendaForm";
import Integraciones from "../../modules/integraciones/Integraciones";
import { useConfiguracion } from "./hooks/useConfiguracion";

const TABS = [
  { key: "empresa",       label: "Empresa" },
  { key: "tienda",        label: "Tienda" },
  { key: "pagos",         label: "Métodos de pago" },
  { key: "integraciones", label: "🚀 Integraciones" }, // ✅ NUEVO
];

export default function Configuracion() {
  const [tabActiva, setTabActiva] = useState("empresa");

  const {
    empresa, metodos, logoPreview, bannerPreview,
    cargando, guardando, error, exito,
    cargarConfiguracion, handleEmpresaChange,
    toggleMetodo, handleLogoChange, handleBannerChange, guardar,
  } = useConfiguracion();

  useEffect(() => {
    cargarConfiguracion();
  }, [cargarConfiguracion]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Cargando configuración...
      </div>
    );
  }

  // La tab de integraciones maneja su propio guardado
  const mostrarBtnGuardar = tabActiva !== "integraciones";

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header con tabs y botón guardar */}
      <div className="flex items-center justify-between mb-5">

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTabActiva(tab.key)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-150 ${
                tabActiva === tab.key
                  ? "bg-white text-gray-700 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Botón guardar — solo en tabs que lo necesitan */}
        {mostrarBtnGuardar && (
          <button
            onClick={guardar}
            disabled={guardando}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${
              guardando
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : exito
                ? "bg-emerald-500 text-white"
                : "bg-cyan-500 text-white hover:bg-cyan-600 active:scale-95"
            }`}
          >
            {guardando ? "Guardando..." : exito ? "✓ Guardado" : "Guardar cambios"}
          </button>
        )}
      </div>

      {/* Error */}
      {error && tabActiva !== "integraciones" && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Contenido */}
      {tabActiva === "empresa" && (
        <EmpresaForm
          empresa={empresa}
          logoPreview={logoPreview}
          onChange={handleEmpresaChange}
          onLogoChange={handleLogoChange}
        />
      )}

      {tabActiva === "tienda" && (
        <TiendaForm
          empresa={empresa}
          bannerPreview={bannerPreview}
          onChange={handleEmpresaChange}
          onBannerChange={handleBannerChange}
        />
      )}

      {tabActiva === "pagos" && (
        <MetodosPago
          metodos={metodos}
          onToggle={toggleMetodo}
        />
      )}

      {/* ✅ NUEVO */}
      {tabActiva === "integraciones" && (
        <Integraciones />
      )}

    </div>
  );
}