import express from 'express';
import cors from 'cors';
import productosRoutes from "./routes/productos.routes.js";
import authRoutes from "./routes/auth.routes.js";

import usuariosRoutes from "./routes/usuarios.routes.js";
import ventasRoutes from "./routes/ventas.routes.js";
	
import clientesRoutes from "./routes/clientes.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Fishware funcionando 🚀');
});


app.use("/api/productos", productosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/empresa", authRoutes);

export default app;