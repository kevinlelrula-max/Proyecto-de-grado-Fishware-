import { useRef } from "react";

const UNIDADES = [
  { value: "unidad",  label: "Unidad / Pieza" },
  { value: "kg",      label: "Kilogramo (kg)" },
  { value: "gramo",   label: "Gramo (g)" },
  { value: "litro",   label: "Litro (L)" },
  { value: "ml",      label: "Mililitro (ml)" },
  { value: "metro",   label: "Metro (m)" },
  { value: "caja",    label: "Caja" },
  { value: "paquete", label: "Paquete" },
  { value: "docena",  label: "Docena" },
];

export default function EmpresaForm({ empresa, logoPreview, onChange, onLogoChange }) {
  const fileInputRef = useRef(null);

  const campos = [
    { key: "nombre",    label: "Nombre de la empresa", tipo: "text",  full: true,  placeholder: "Pesquera Estrada" },
    { key: "nit",       label: "NIT",                  tipo: "text",  full: false, placeholder: "900.123.456-7" },
    { key: "telefono",  label: "Teléfono",             tipo: "tel",   full: false, placeholder: "+57 8 785 0000" },
    { key: "email",     label: "Correo electrónico",   tipo: "email", full: true,  placeholder: "ventas@empresa.com" },
    { key: "direccion", label: "Dirección",            tipo: "text",  full: true,  placeholder: "Cra. 5 #12-30, Neiva, Huila" },
  ];

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) onLogoChange(file);
  }

  return (
    <div className="space-y-6">

      {/* Logo */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-1">Logo de la empresa</h3>
        <p className="text-sm text-gray-400 mb-4">
          Aparece en el dashboard y en los PDFs de ventas
        </p>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
        >
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo empresa"
              className="h-20 object-contain rounded-lg"
            />
          ) : (
            <>
              <span className="text-3xl">🖼️</span>
              <p className="text-sm text-gray-500">Haz clic para subir el logo</p>
              <p className="text-xs text-gray-400">PNG, JPG · máx. 2 MB</p>
            </>
          )}

          {logoPreview && (
            <p className="text-xs text-cyan-500 mt-1">Haz clic para cambiar</p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Datos */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-1">Datos de la empresa</h3>
        <p className="text-sm text-gray-400 mb-5">
          Información que aparece en los documentos generados
        </p>

        <div className="grid grid-cols-2 gap-4">
          {campos.map((campo) => (
            <div
              key={campo.key}
              className={campo.full ? "col-span-2" : "col-span-1"}
            >
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {campo.label}
              </label>
              <input
                type={campo.tipo}
                value={empresa[campo.key] || ""}
                placeholder={campo.placeholder}
                onChange={(e) => onChange(campo.key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
              />
            </div>
          ))}

          {/* Unidad predeterminada */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Unidad predeterminada para productos nuevos
            </label>
            <select
              value={empresa.unidad_predeterminada || "unidad"}
              onChange={(e) => onChange("unidad_predeterminada", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition bg-white"
            >
              {UNIDADES.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Se usará como valor por defecto al crear un nuevo producto. Cada producto puede cambiarse individualmente.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}