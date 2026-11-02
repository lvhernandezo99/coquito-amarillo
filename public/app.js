const formulario = document.getElementById("formPedido");
const mensaje = document.getElementById("mensaje");
const boton = formulario.querySelector("button");

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = tipo;
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  // Validación nativa de HTML5 (required, type, min)
  if (!formulario.checkValidity()) {
    formulario.reportValidity();
    return;
  }

  const datos = {
    nombreCliente: formulario.nombreCliente.value.trim(),
    producto: formulario.producto.value.trim(),
    cantidad: Number(formulario.cantidad.value),
    correo: formulario.correo.value.trim()
  };

  boton.disabled = true;
  try {
    const respuesta = await fetch("/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    const resultado = await respuesta.json();

    if (respuesta.status === 201) {
      mostrarMensaje(resultado.mensaje, "exito");
      formulario.reset();
    } else if (respuesta.status === 207) {
      mostrarMensaje(`${resultado.mensaje} (CSV: ${resultado.csv}, MySQL: ${resultado.mysql})`, "error");
    } else {
      const detalle = resultado.detalles ? " " + resultado.detalles.join(" ") : "";
      mostrarMensaje((resultado.error || "Error al registrar") + detalle, "error");
    }
  } catch (error) {
    console.error(error);
    mostrarMensaje("No se pudo conectar con el servidor.", "error");
  } finally {
    boton.disabled = false;
  }
});
