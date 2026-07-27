import { useEnvioConfig } from "./hooks/useEnvioConfig";

const DEPARTAMENTOS = [
  { id: 5,  nombre: "Antioquia" },
  { id: 8,  nombre: "Atlántico" },
  { id: 11, nombre: "Bogotá D.C." },
  { id: 13, nombre: "Bolívar" },
  { id: 15, nombre: "Boyacá" },
  { id: 17, nombre: "Caldas" },
  { id: 18, nombre: "Caquetá" },
  { id: 19, nombre: "Cauca" },
  { id: 20, nombre: "Cesar" },
  { id: 23, nombre: "Córdoba" },
  { id: 25, nombre: "Cundinamarca" },
  { id: 27, nombre: "Chocó" },
  { id: 41, nombre: "Huila" },
  { id: 44, nombre: "La Guajira" },
  { id: 47, nombre: "Magdalena" },
  { id: 50, nombre: "Meta" },
  { id: 52, nombre: "Nariño" },
  { id: 54, nombre: "Norte de Santander" },
  { id: 63, nombre: "Quindío" },
  { id: 66, nombre: "Risaralda" },
  { id: 68, nombre: "Santander" },
  { id: 70, nombre: "Sucre" },
  { id: 73, nombre: "Tolima" },
  { id: 76, nombre: "Valle del Cauca" },
  { id: 81, nombre: "Arauca" },
  { id: 85, nombre: "Casanare" },
  { id: 86, nombre: "Putumayo" },
  { id: 88, nombre: "San Andrés y Providencia" },
  { id: 91, nombre: "Amazonas" },
  { id: 94, nombre: "Guainía" },
  { id: 95, nombre: "Guaviare" },
  { id: 97, nombre: "Vaupés" },
  { id: 99, nombre: "Vichada" },
];

export default function EnvioConfig() {
  const {
    costoDefecto, setCostoDefecto,
    costosDepts, setCostoDept,
    loading, guardando, error, exito,
    guardar,
  } = useEnvioConfig();

  if (loading) {
    return <div style={s.loading}>Cargando configuración de envío...</div>;
  }

  const depsConCostoEspecifico = DEPARTAMENTOS.filter(d => costosDepts[String(d.id)] !== undefined);

  return (
    <div style={s.wrap}>

      <div style={s.header}>
        <div>
          <h2 style={s.title}>Configuración de envío</h2>
          <p style={s.subtitle}>
            Define el costo por departamento. Deja vacío para usar el costo por defecto. Pon 0 para envío gratis.
          </p>
        </div>
        <button
          style={{ ...s.btnGuardar, opacity: guardando ? 0.7 : 1 }}
          onClick={guardar}
          disabled={guardando}
        >
          {guardando ? "Guardando..." : exito ? "✓ Guardado" : "Guardar cambios"}
        </button>
      </div>

      {error && <div style={s.errorBox}>⚠️ {error}</div>}

      {/* Costo por defecto */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>💰 Costo por defecto</h3>
        <p style={s.cardDesc}>
          Se aplica a los departamentos que no tengan un costo específico.
        </p>
        <div style={s.inputWrap}>
          <span style={s.inputPrefix}>$</span>
          <input
            type="number"
            min="0"
            style={s.input}
            value={costoDefecto}
            onChange={e => setCostoDefecto(Math.max(0, Number(e.target.value)))}
            placeholder="0"
          />
          <span style={s.inputSuffix}>COP</span>
        </div>
        {costoDefecto === 0 && (
          <p style={s.hint}>💡 Con costo 0 el envío es gratis para todos los departamentos sin costo específico.</p>
        )}
      </div>

      {/* Todos los departamentos */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>🗺️ Costo por departamento</h3>
        <p style={s.cardDesc}>
          Configura un costo individual. Si lo dejas vacío usa el costo por defecto (${Number(costoDefecto).toLocaleString("es-CO")}).
        </p>

        <div style={s.deptGrid}>
          {DEPARTAMENTOS.map(dept => {
            const key   = String(dept.id);
            const valor = costosDepts[key];
            const tieneEspecifico = valor !== undefined;

            return (
              <div
                key={dept.id}
                style={{
                  ...s.deptCard,
                  borderColor: tieneEspecifico ? "#0F6E56" : "#e2e8f0",
                  backgroundColor: tieneEspecifico ? "#f0fdf8" : "white",
                }}
              >
                <span style={s.deptNombre}>{dept.nombre}</span>
                <div style={s.deptInputRow}>
                  <span style={s.deptPrefix}>$</span>
                  <input
                    type="number"
                    min="0"
                    style={s.deptInput}
                    value={valor ?? ""}
                    placeholder={String(costoDefecto)}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === "") {
                        setCostoDept(dept.id, undefined);
                      } else {
                        setCostoDept(dept.id, v);
                      }
                    }}
                  />
                </div>
                {tieneEspecifico && Number(valor) === 0 && (
                  <span style={s.gratisBadge}>Gratis</span>
                )}
                {!tieneEspecifico && (
                  <span style={s.defectoBadge}>Por defecto</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen */}
      <div style={s.resumen}>
        <h3 style={s.cardTitle}>📋 Resumen</h3>
        <div style={s.resumenRow}>
          <span style={s.resumenLabel}>Costo por defecto</span>
          <span style={s.resumenVal}>
            {costoDefecto === 0 ? "Gratis" : `$${Number(costoDefecto).toLocaleString("es-CO")}`}
          </span>
        </div>
        <div style={s.resumenRow}>
          <span style={s.resumenLabel}>Con costo específico</span>
          <span style={s.resumenVal}>{depsConCostoEspecifico.length} departamento(s)</span>
        </div>
        {depsConCostoEspecifico.filter(d => Number(costosDepts[String(d.id)]) === 0).length > 0 && (
          <div style={s.resumenRow}>
            <span style={s.resumenLabel}>Con envío gratis</span>
            <span style={{ ...s.resumenVal, color: "#0F6E56" }}>
              {depsConCostoEspecifico.filter(d => Number(costosDepts[String(d.id)]) === 0).length} departamento(s)
            </span>
          </div>
        )}
      </div>

    </div>
  );
}

const s = {
  wrap:          { padding: "8px 0", display: "flex", flexDirection: "column", gap: "20px" },
  loading:       { padding: "40px", textAlign: "center", color: "#64748b", fontSize: "14px" },
  header:        { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" },
  title:         { fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" },
  subtitle:      { fontSize: "13px", color: "#64748b" },
  btnGuardar:    { padding: "9px 20px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", flexShrink: 0 },
  errorBox:      { backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#b91c1c" },
  card:          { backgroundColor: "white", border: "1.5px solid #e2e8f0", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" },
  cardTitle:     { fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: 0 },
  cardDesc:      { fontSize: "13px", color: "#64748b", margin: 0 },
  inputWrap:     { display: "flex", alignItems: "center", gap: "8px", maxWidth: "240px" },
  inputPrefix:   { fontSize: "18px", fontWeight: "700", color: "#0F6E56" },
  input:         { flex: 1, padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "16px", fontWeight: "700", color: "#0f172a", outline: "none", textAlign: "right" },
  inputSuffix:   { fontSize: "13px", color: "#94a3b8", fontWeight: "600" },
  hint:          { fontSize: "12px", color: "#0F6E56", margin: 0 },
  deptGrid:      { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" },
  deptCard:      { display: "flex", flexDirection: "column", gap: "6px", padding: "12px", border: "1.5px solid", borderRadius: "10px", transition: "all 0.15s" },
  deptNombre:    { fontSize: "12px", fontWeight: "600", color: "#0f172a" },
  deptInputRow:  { display: "flex", alignItems: "center", gap: "4px" },
  deptPrefix:    { fontSize: "13px", fontWeight: "700", color: "#0F6E56" },
  deptInput:     { flex: 1, padding: "5px 8px", border: "1.5px solid #e2e8f0", borderRadius: "7px", fontSize: "13px", fontWeight: "600", color: "#0f172a", outline: "none", textAlign: "right", width: "100%" },
  gratisBadge:   { backgroundColor: "#E1F5EE", color: "#0F6E56", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "999px", alignSelf: "flex-start" },
  defectoBadge:  { backgroundColor: "#f1f5f9", color: "#94a3b8", fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "999px", alignSelf: "flex-start" },
  resumen:       { backgroundColor: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" },
  resumenRow:    { display: "flex", justifyContent: "space-between", fontSize: "13px" },
  resumenLabel:  { color: "#64748b" },
  resumenVal:    { fontWeight: "700", color: "#0f172a" },
};
