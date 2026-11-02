const path = require("path");
const express = require("express");
const mysql = require("mysql2/promise");
const RegistroPedido = require("./src/RegistroPedido");
const PedidoRepositorio = require("./src/PedidoRepositorio");

const PUERTO = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); 

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "coquito_amarillo",
  waitForConnections: true,
  connectionLimit: 5
});

const repositorio = new PedidoRepositorio(pool, path.join(__dirname, "Datos.csv"));

app.post("/registrar", async (req, res) => {
  try {
    const { nombreCliente, producto, cantidad, correo } = req.body;
    const registro = new RegistroPedido(nombreCliente, producto, cantidad, correo);

    const errores = registro.validar();
    if (errores.length > 0) {
      return res.status(400).json({ error: "Datos incompletos o inválidos", detalles: errores });
    }

    const { csv, mysql: bd } = await repositorio.guardar(registro);
    const csvOk = csv.status === "fulfilled";
    const bdOk = bd.status === "fulfilled";

    if (!csvOk) console.error("Error al escribir en CSV:", csv.reason);
    if (!bdOk) console.error("Error al insertar en MySQL:", bd.reason);

    if (csvOk && bdOk) {
      return res.status(201).json({ mensaje: "Registro guardado exitosamente en CSV y MySQL", id: bd.value });
    }
    if (csvOk || bdOk) {
      return res.status(207).json({
        mensaje: "Registro guardado parcialmente",
        csv: csvOk ? "ok" : "falló",
        mysql: bdOk ? "ok" : "falló"
      });
    }
    return res.status(500).json({ error: "No se pudo guardar el registro en ningún destino" });
  } catch (error) {
    console.error("Error inesperado:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

async function iniciar() {
  try {
    await repositorio.inicializarCSV();
    await pool.query("SELECT 1");
    console.log("Conexión a MySQL exitosa");
  } catch (error) {
    console.error("Advertencia: no hay conexión a MySQL:", error.message);
  }
  app.listen(PUERTO, () => console.log(`Servidor escuchando en http://localhost:${PUERTO}`));
}

iniciar();
