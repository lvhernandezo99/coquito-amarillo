# Documento de diseño — Coquito Amarillo S.A.S.

## 1. Problema
Los pedidos se anotan en papel: hay pérdida de datos y demora en los reportes de ventas.

## 2. Arquitectura (frontend – backend – BD)
```
Navegador (HTML/CSS/JS)  --POST /registrar (JSON)-->  Node.js + Express
                                                         |-- RegistroPedido (valida, toCSV)
                                                         |-- PedidoRepositorio
                                                               |-- Datos.csv  (appendFile)
                                                               |-- MySQL      (INSERT, pool mysql2)
```

## 3. Campos del formulario
| Campo | Tipo HTML | Validación cliente | Validación servidor |
|---|---|---|---|
| nombreCliente | text | required, maxlength 100 | no vacío, ≤100 |
| producto | text | required, maxlength 100 | no vacío, ≤100 |
| cantidad | number | required, min=1, step=1 | entero > 0 |
| correo | email | required, type=email | regex de formato, ≤150 |

## 4. Modelo de datos
Tabla `registros` (ver `sql/script.sql`): id (PK autoincremental), nombre_cliente, producto, cantidad, correo, fecha_registro (DEFAULT CURRENT_TIMESTAMP).

## 5. Decisiones de diseño
- **POO:** `RegistroPedido` encapsula los datos, valida y genera su línea CSV; `PedidoRepositorio` encapsula el acceso a datos (CSV y MySQL). Separa responsabilidades y facilita migrar totalmente a BD (basta quitar `guardarEnCSV`).
- **Validación doble:** el navegador da respuesta rápida; el servidor no confía en el cliente.
- **Pool de conexiones** (`mysql2/promise`) en lugar de una conexión única: se recupera si MySQL se reinicia.
- **Promise.allSettled:** ambos destinos se intentan siempre; si uno falla se responde 207 indicando cuál, en vez de perder el dato en silencio.
- **Escape CSV:** comas, comillas y saltos de línea se escapan; valores que empiezan con `= + - @` se neutralizan para evitar inyección de fórmulas en Excel.
- **appendFile:** nunca sobrescribe; el encabezado se crea solo si el archivo no existe.
- **Manejo de errores:** try/catch en el endpoint y en el arranque; códigos HTTP 201, 207, 400, 500.
