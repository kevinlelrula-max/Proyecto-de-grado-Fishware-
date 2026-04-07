import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="font-sans">

      {/* 🔷 NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-5 bg-slate-900 text-white shadow-md">
        <h2 className="text-2xl font-bold text-cyan-400">FishWare</h2>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/empresa/login")}
            className="px-4 py-2 border border-white rounded-lg hover:bg-white hover:text-slate-900 transition"
          >
            Iniciar sesión
          </button>

          <button
            onClick={() => navigate("/empresa/registro")}
            className="px-4 py-2 bg-cyan-400 text-black rounded-lg font-semibold hover:bg-cyan-300 transition"
          >
            Registrarse
          </button>
        </div>
      </nav>

      {/* 🔥 HERO */}
      <section className="text-center py-28 px-6 bg-gradient-to-r from-cyan-500 to-green-400 text-white">
        <h1 className="text-5xl font-bold mb-6">
          Gestiona tu empresa en un solo lugar
        </h1>

        <p className="text-lg max-w-2xl mx-auto opacity-90">
          FishWare es una plataforma multiempresa que te permite administrar productos,
          ventas, clientes y usuarios de forma fácil, segura y escalable.
        </p>

        <div className="mt-8">
          <button
            onClick={() => navigate("/empresa/login")}
            className="px-6 py-3 bg-slate-900 rounded-xl text-white font-semibold hover:scale-105 transition transform"
          >
            Comenzar ahora 🚀
          </button>
        </div>
      </section>

      {/* 📊 FEATURES */}
      <section className="py-20 px-6 text-center bg-gray-50">
        <h2 className="text-3xl font-bold mb-12 text-slate-800">
          ¿Qué puedes hacer con FishWare?
        </h2>

        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">📦 Productos</h3>
            <p className="text-gray-600">Administra tu inventario en tiempo real</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">💰 Ventas</h3>
            <p className="text-gray-600">Registra ventas y controla ingresos</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">👥 Usuarios</h3>
            <p className="text-gray-600">Gestiona roles y accesos</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">🏢 Multiempresa</h3>
            <p className="text-gray-600">Cada empresa con sus propios datos seguros</p>
          </div>

        </div>
      </section>

      {/* 🔻 FOOTER */}
      <footer className="bg-slate-900 text-white text-center py-6">
        <p className="text-sm opacity-80">
          © 2026 FishWare - Plataforma empresarial
        </p>
      </footer>
    </div>
  );
}