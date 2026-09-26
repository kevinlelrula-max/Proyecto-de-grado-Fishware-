import { useRef } from "react";
import { ImageIcon, MessageCircle, Camera, Globe } from "lucide-react";

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

const REDES = [
  { key: "whatsapp",  label: "WhatsApp",  Icon: MessageCircle, placeholder: "573001234567 (sin + ni espacios)" },
  { key: "instagram", label: "Instagram", Icon: Camera,        placeholder: "@minegocio" },
  { key: "facebook",  label: "Facebook",  Icon: Globe,         placeholder: "minegocio" },
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
      <div className="bg-white rounded-2xl border-[1.5px] border-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-1">Logo de la empresa</h3>
        <p className="text-sm text-slate-500 mb-4">
          Aparece en el dashboard y en los PDFs de ventas
        </p>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 cursor-pointer transition"
        >
          {logoPreview ? (
            <img src={logoPreview} alt="Logo empresa" className="h-20 object-contain rounded-lg" />
          ) : (
            <>
              <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                <ImageIcon size={20} />
              </span>
              <p className="text-sm text-gray-500">Haz clic para subir el logo</p>
              <p className="text-xs text-gray-400">PNG, JPG · máx. 2 MB</p>
            </>
          )}
          {logoPreview && (
            <p className="text-xs text-blue-500 mt-1">Haz clic para cambiar</p>
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
      <div className="bg-white rounded-2xl border-[1.5px] border-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-1">Datos de la empresa</h3>
        <p className="text-sm text-slate-500 mb-5">
          Información que aparece en los documentos generados
        </p>

        <div className="grid grid-cols-2 gap-5">
          {campos.map((campo) => (
            <div key={campo.key} className={campo.full ? "col-span-2" : "col-span-1"}>
              <label className="block text-[13px] font-semibold text-slate-800 mb-2">
                {campo.label}
              </label>
              <input
                type={campo.tipo}
                value={empresa[campo.key] || ""}
                placeholder={campo.placeholder}
                onChange={(e) => onChange(campo.key, e.target.value)}
                className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-[15px] text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          ))}

          {/* Unidad predeterminada */}
          <div className="col-span-2">
            <label className="block text-[13px] font-semibold text-slate-800 mb-2">
              Unidad predeterminada para productos nuevos
            </label>
            <select
              value={empresa.unidad_predeterminada || "unidad"}
              onChange={(e) => onChange("unidad_predeterminada", e.target.value)}
              className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-[15px] text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              {UNIDADES.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Se usará como valor por defecto al crear un nuevo producto. Cada producto puede cambiarse individualmente.
            </p>
          </div>

          {/* IVA */}
          <div className="col-span-1">
            <label className="block text-[13px] font-semibold text-slate-800 mb-2">
              IVA / Impuesto (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={empresa.iva_porcentaje ?? 0}
              onChange={(e) => onChange("iva_porcentaje", Number(e.target.value))}
              className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-[15px] text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <p className="text-xs text-slate-400 mt-1">
              Ej: 19 para Colombia. Se aplica al subtotal en ventas y tienda. Usa 0 para desactivar.
            </p>
          </div>
        </div>
      </div>

      {/* Redes sociales */}
      <div className="bg-white rounded-2xl border-[1.5px] border-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-1">Redes sociales</h3>
        <p className="text-sm text-slate-500 mb-5">Aparecen en la sección de contacto de tu tienda</p>

        <div className="space-y-4">
          {REDES.map(({ key, label, Icon, placeholder }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                <Icon size={16} />
              </span>
              <div className="flex-1">
                <label className="block text-[13px] font-semibold text-slate-800 mb-2">{label}</label>
                <input
                  type="text"
                  value={empresa[key] || ""}
                  onChange={(e) => onChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-[15px] text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
