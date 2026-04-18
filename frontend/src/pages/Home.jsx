import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="font-sans bg-gray-50">

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
            className="px-4 py-2 bg-cyan-400 text-black rounded-lg font-semibold hover:bg-cyan-300 hover:scale-105 transition"
          >
            Registrarse
          </button>
        </div>
      </nav>

      {/* 🔥 HERO */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 text-white px-10">
        <div className="grid md:grid-cols-2 gap-10 items-center max-w-6xl">

          {/* TEXTO */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-6">
              Gestiona tu empresa <span className="text-cyan-400">sin límites</span>
            </h1>

            <p className="text-lg opacity-80 mb-6">
              Controla productos, ventas, clientes y usuarios desde un solo lugar.
              Rápido, seguro y escalable.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/empresa/registro")}
                className="px-6 py-3 bg-cyan-400 text-black rounded-xl font-bold hover:scale-110 transition"
              >
                Crear cuenta 🚀
              </button>

              <button
                onClick={() => navigate("/empresa/login")}
                className="px-6 py-3 border border-white rounded-xl hover:bg-white hover:text-black transition"
              >
                Iniciar sesión
              </button>
            </div>
          </motion.div>

          {/* IMAGEN */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71"
              alt="dashboard"
              className="rounded-2xl shadow-2xl hover:scale-105 transition duration-500"
            />
          </motion.div>

        </div>
      </section>

      {/* 📊 FEATURES */}
      <section className="py-20 px-6 text-center bg-gray-50">
        <h2 className="text-3xl font-bold mb-12 text-slate-800">
          ¿Qué puedes hacer con FishWare?
        </h2>

        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-8 max-w-6xl mx-auto">

          {[
            { title: "📦 Productos", desc: "Administra tu inventario en tiempo real" },
            { title: "💰 Ventas", desc: "Registra ventas y controla ingresos" },
            { title: "👥 Usuarios", desc: "Gestiona roles y accesos" },
            { title: "🏢 Multiempresa", desc: "Datos separados y seguros" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.08 }}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl transition cursor-pointer"
            >
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}

        </div>
      </section>

      {/* 🔥 SECCIÓN STORYTELLING */}
      <section className="py-20 px-10 bg-white">
        <div className="grid md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">

          {/* TEXTO */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Control total de tu negocio
            </h2>

            <p className="text-gray-600 mb-4">
              Visualiza tus ventas, gestiona inventario y toma decisiones en tiempo real
              desde un panel intuitivo.
            </p>

            <ul className="text-gray-600 space-y-2">
              <li>✔ Control de stock automático</li>
              <li>✔ Reportes inteligentes</li>
              <li>✔ Gestión multiusuario</li>
            </ul>
          </motion.div>

          {/* IMAGEN */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img
              src="https://images.unsplash.com/photo-1556155092-490a1ba16284"
              alt="analytics"
              className="rounded-xl shadow-lg hover:scale-105 transition"
            />
          </motion.div>

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