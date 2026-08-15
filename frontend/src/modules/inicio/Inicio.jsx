import { useState } from "react";
import { Sun, Sunrise, Moon } from "lucide-react";
import { useInicio } from "./hooks/useInicio";
import StatCard            from "./components/StatCard";
import OnboardingCard      from "./components/OnboardingCard";
import PedidosRecientes    from "./components/PedidosRecientes";
import AccesosRapidos      from "./components/AccesosRapidos";
import BannerReferidos     from "./components/BannerReferidos";
import ModalQR             from "./components/ModalQR";
import ResumenDiario        from "./components/ResumenDiario";
import InsightWidget        from "./components/InsightWidget";
import ClientesReconquistar from "./components/ClientesReconquistar";
import StockCriticoWidget  from "./components/StockCriticoWidget";

function getIconoSaludo(saludo) {
  if (saludo === "Buenos días")  return Sunrise;
  if (saludo === "Buenas tardes") return Sun;
  return Moon;
}

function getNombreEmpresa() {
  try {
    const config = JSON.parse(localStorage.getItem("fishware_configuracion") || "{}");
    return config?.empresa?.nombre || "tu empresa";
  } catch {
    return "tu empresa";
  }
}

export default function Inicio({ onIrA }) {
  const {
    resumen, loading, error,
    saludo, nombreUsuario,
    onboarding, esOnboardingCompleto,
  } = useInicio();

  const [forzarDashboard, setForzarDashboard] = useState(false);
  const [mostrarQR, setMostrarQR]             = useState(false);

  const mostrarOnboarding = !esOnboardingCompleto && !forzarDashboard;
  const slug              = localStorage.getItem("empresa_slug") || "";
  const linkTienda        = slug ? `${window.location.origin}/tienda/${slug}` : null;
  const empresaNombre     = getNombreEmpresa();
  const IconoSaludo       = getIconoSaludo(saludo);

  if (loading) {
    return (
      <div style={s.loading}>
        <div style={s.spinner} />
        <p style={s.loadingText}>Cargando tu panel...</p>
      </div>
    );
  }

  if (error) {
    return <div style={s.errorBox}>{error}</div>;
  }

  return (
    <div style={s.page} className="inicio-page">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .inicio-page   { padding: 16px !important; }
          .inicio-stats  { grid-template-columns: repeat(2,1fr) !important; gap: 12px !important; }
          .inicio-accesos { grid-template-columns: 1fr !important; }
          .inicio-main   { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Encabezado */}
      <div style={s.header}>
        <div>
          <div className="mb-1">
            <span className="text-sm font-medium capitalize text-primary">
              {new Date().toLocaleDateString("es-CO", {
                weekday: "long", day: "numeric", month: "long",
              })}
            </span>
          </div>
          <h2 style={s.saludo}>{saludo}, {nombreUsuario}</h2>
          <p style={s.subtitulo}>
            Esto es lo que está pasando hoy en {empresaNombre}. Vamos con todo.
          </p>
        </div>
        {linkTienda && (
          <a href={linkTienda} target="_blank" rel="noreferrer" style={s.btnTienda}>
            Ver mi tienda
          </a>
        )}
      </div>

      {mostrarOnboarding ? (
        <OnboardingCard
          onboarding={onboarding}
          onIrA={onIrA}
          onSkip={() => setForzarDashboard(true)}
        />
      ) : (
        <>
          <InsightWidget />

          <ResumenDiario />

          <StockCriticoWidget onIrA={onIrA} />

          {/* KPIs */}
          <div style={s.statsGrid} className="inicio-stats">
            <StatCard
              label="Ventas hoy"
              valor={`$${Number(resumen?.ventasHoy?.ingresos_hoy || 0).toLocaleString("es-CO")}`}
              descripcion={`${resumen?.ventasHoy?.total_ventas || 0} transacciones`}
            />
            <StatCard
              label="Pedidos pendientes"
              valor={resumen?.pedidosPendientes || 0}
              descripcion="Sin atender"
              alerta={resumen?.pedidosPendientes > 0}
            />
            <StatCard
              label="Stock bajo"
              valor={resumen?.stockBajo || 0}
              descripcion="Bajo el mínimo"
              alerta={resumen?.stockBajo > 0}
            />
            <StatCard
              label="Clientes"
              valor={resumen?.totalClientes || 0}
              descripcion="Registrados"
            />
          </div>

          {/* Accesos rápidos */}
          <AccesosRapidos onIrA={onIrA} />

          {/* Contenido principal: pedidos + meta | clientes por reconquistar */}
          <div style={s.mainGrid} className="inicio-main">
            <PedidosRecientes pedidos={resumen?.ultimosPedidos} onIrA={onIrA} />
            <ClientesReconquistar
              clientes={resumen?.clientesDormidos || []}
              onIrA={onIrA}
            />
          </div>

          {/* Banner referidos — solo si no está activado */}
          {!onboarding?.tieneReferidos && (resumen?.totalClientes ?? 0) > 0 && (
            <BannerReferidos onIrA={onIrA} totalClientes={resumen.totalClientes} />
          )}
        </>
      )}

      {mostrarQR && linkTienda && (
        <ModalQR url={linkTienda} onClose={() => setMostrarQR(false)} />
      )}
    </div>
  );
}

const s = {
  page: {
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  // Header
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
  },
  fecha: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: 500,
    textTransform: "capitalize",
    marginBottom: 4,
  },
  saludo: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.02em",
    marginBottom: "4px",
  },
  subtitulo: {
    fontSize: "14px",
    color: "#64748b",
  },
  btnTienda: {
    padding: "10px 20px",
    backgroundColor: "#0B1628",
    color: "white",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    alignSelf: "center",
  },

  // KPIs
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
  },

  // Layout principal
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "20px",
    alignItems: "start",
  },

  // Estados
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "80px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "3px solid #e2e8f0",
    borderTopColor: "#00C9A7",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { fontSize: "14px", color: "#94a3b8" },
  errorBox: {
    margin: "28px",
    padding: "14px 16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    fontSize: "13px",
    color: "#b91c1c",
  },
};
