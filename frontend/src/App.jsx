import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

// Usuarios (clientes)
import Login from "./pages/Login";
import Register from "./pages/Register";

// Empresas (admin + empresa)
import RegistroEmpresa from "./components/RegistroEmpresa";
import LoginEmpresa from "./components/LoginEmpresa";
import DashboardEmpresa from "./components/DashboardEmpresa"; // ✅ Importa el dashboard


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
{/* Rutas empresas */}
        <Route path="/empresa/registro" element={<RegistroEmpresa />} />
        <Route path="/empresa/login" element={<LoginEmpresa />} />
        {/* Rutas clientes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardEmpresa />} /> {/* ✅ Ruta del dashboard */}

        
      </Routes>
    </BrowserRouter>
  );
}

export default App;