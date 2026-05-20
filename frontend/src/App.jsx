import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

// Empresas
import RegistroEmpresa from "./components/RegistroEmpresa";
import LoginEmpresa from "./components/LoginEmpresa";
import DashboardEmpresa from "./components/DashboardEmpresa";
import Perfil from "./modules/perfil/Perfil";

// POS
import Ventas from "./pages/VentasEmpresa";

// Reportes
import Reportes from "./pages/Reportes";

// Tienda cliente
import LoginCliente          from "./pages/LoginCliente";
import RegistroCliente       from "./pages/RegistroCliente";
import RecuperarContrasena   from "./pages/RecuperarContrasena";
import ResetearContrasena    from "./pages/ResetearContrasena";
import TiendaEmpresa from "./pages/TiendaEmpresa";
import MisPedidos from "./pages/MisPedidos";
import PerfilCliente from "./modules/perfilCliente/PerfilCliente";
import TiendaInicio   from "./modules/tienda/TiendaInicio";
import TiendaCatalogo from "./modules/tienda/TiendaCatalogo";
import TiendaContacto from "./modules/tienda/TiendaContacto";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Página principal ── */}
        <Route path="/" element={<Home />} />

        {/* ── Empresas ── */}
        <Route path="/empresa/registro" element={<RegistroEmpresa />} />
        <Route path="/empresa/login"    element={<LoginEmpresa />} />

        {/* ── Dashboard empresa ── */}
        <Route path="/dashboard" element={<DashboardEmpresa />} />
        <Route path="/perfil"    element={<Perfil />} />
        <Route path="/ventas"    element={<Ventas />} />
        <Route path="/reportes"  element={<Reportes />} />

        {/* ── Tienda online del cliente ── */}
        <Route path="/tienda/login"                element={<LoginCliente />} />
        <Route path="/tienda/registro"             element={<RegistroCliente />} />
        <Route path="/tienda/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/tienda/resetear-contrasena"  element={<ResetearContrasena />} />
        <Route path="/tienda/mis-pedidos" element={<MisPedidos />} />
        <Route path="/tienda/perfil" element={<PerfilCliente />} />
        <Route path="/tienda/:empresaSlug"          element={<TiendaInicio />} />
        <Route path="/tienda/:empresaSlug/catalogo" element={<TiendaCatalogo />} />
        <Route path="/tienda/:empresaSlug/contacto" element={<TiendaContacto />} />
        <Route path="/tienda/:empresaSlug/pedidos"  element={<MisPedidos />} />

        {/* 🚫 Fallback global */}
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;