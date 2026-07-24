const express = require("express");
const path = require("path");

const gearRoutes = require("./routes/gearRoutes");

const app = express();
const PORT = 3000;

// Permitir recibir JSON
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rutas de la API
app.use("/api", gearRoutes);

// Levantar servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});