/**
 * Clase que encapsula un pedido (usando POO)
 */
class RegistroPedido {
  static REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(nombreCliente, producto, cantidad, correo) {
    this.nombreCliente = String(nombreCliente ?? "").trim();
    this.producto = String(producto ?? "").trim();
    this.cantidad = Number(cantidad);  
    this.correo = String(correo ?? "").trim();
    this.fecha = new Date().toISOString();
  }

  /** Devuelve un arreglo con los errores encontrados (vacío si no se presentan errores). */
  validar() {
    const errores = [];

    if (this.nombreCliente === "") {
      errores.push("El nombre del cliente es obligatorio.");
    } else if (this.nombreCliente.length > 100) {
      errores.push("El nombre no puede superar 100 caracteres.");
    }

    if (this.producto === "") {
      errores.push("El producto es obligatorio.");
    } else if (this.producto.length > 100) {
      errores.push("El producto no puede superar 100 caracteres.");
    }

    if (!Number.isInteger(this.cantidad)) {
      errores.push("La cantidad debe ser un número entero.");
    } else if (this.cantidad <= 0) {
      errores.push("La cantidad debe ser mayor que cero.");
    }

    if (this.correo === "") {
      errores.push("El correo electrónico es obligatorio.");
    } else if (!RegistroPedido.REGEX_CORREO.test(this.correo)) {
      errores.push("El correo electrónico no tiene un formato válido.");
    } else if (this.correo.length > 150) {
      errores.push("El correo no puede superar 150 caracteres.");
    }

    return errores;
  }

  /** Validacion valores del archivo CSV */
  static escaparCSV(valor) {
    let texto = String(valor);
    // Evita inyección de fórmulas al abrir en Excel
    if (/^[=+\-@]/.test(texto)) texto = "'" + texto;
    if (/[",\n\r]/.test(texto)) texto = '"' + texto.replace(/"/g, '""') + '"';
    return texto;
  }

  toCSV() {
    return [
      this.nombreCliente,
      this.producto,
      this.cantidad,
      this.correo,
      this.fecha
    ].map(RegistroPedido.escaparCSV).join(",") + "\n";
  }
}

module.exports = RegistroPedido;
