const fs = require("fs").promises;

/**
 * Clase de acceso a datos: guarda en el archivo Datos.csv y en MySQL
 */
class PedidoRepositorio {
  static ENCABEZADO = "nombre_cliente,producto,cantidad,correo,fecha\n";

  constructor(pool, rutaCSV) {
    this.pool = pool;
    this.rutaCSV = rutaCSV;
  }

  /** Crea el CSV con encabezado si no existe (no sobrescribe) */
  async inicializarCSV() {
    try {
      await fs.access(this.rutaCSV);
    } catch {
      await fs.writeFile(this.rutaCSV, PedidoRepositorio.ENCABEZADO, "utf8");
    }
  }

  async guardarEnCSV(registro) {
    await fs.appendFile(this.rutaCSV, registro.toCSV(), "utf8");
  }

  async guardarEnMySQL(registro) {
    const sql =
      "INSERT INTO registros (nombre_cliente, producto, cantidad, correo) VALUES (?, ?, ?, ?)";
    const [resultado] = await this.pool.execute(sql, [
      registro.nombreCliente,
      registro.producto,
      registro.cantidad,
      registro.correo
    ]);
    return resultado.insertId;
  }

  /** Guarda en ambos lugares y retorna el resultado de cada uno. */
  async guardar(registro) {
    const [csv, mysql] = await Promise.allSettled([
      this.guardarEnCSV(registro),
      this.guardarEnMySQL(registro)
    ]);
    return { csv, mysql };
  }
}

module.exports = PedidoRepositorio;
