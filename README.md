# Coquito Amarillo S.A.S. — Registro de Pedidos

Aplicación web que guarda pedidos por medio de un formulario y los guarda al mismo tiempo en `Datos.csv` y en MySQL.

## Requisitos
- Node.js 18 o superior
- MySQL 8 (o MariaDB) en ejecución

## Estructura
```
coquito-amarillo/
├── servidor.js            # Express + endpoint POST /registrar
├── src/
│   ├── RegistroPedido.js  # Clase POO: validación y toCSV()
│   └── PedidoRepositorio.js # Clase de acceso a datos (CSV + MySQL)
├── public/                # Frontend: index.html, estilos.css, app.js
├── sql/script.sql         # Creación de BD y tabla
├── sql/datos_prueba.sql   # 5 registros de prueba
├── docs/DISENO.md         # Documento de diseño
├── Datos.csv              # Archivo con 5 registros de prueba
└── package.json
```

## Instalación
1. `npm install`
2. Crear la base de datos: `mysql -u root -p < sql/script.sql`
3. (Opcional) cargar datos de prueba: `mysql -u root -p < sql/datos_prueba.sql`

## Configuración de la conexión
Por defecto usa `localhost`, usuario `root`, sin contraseña y base `coquito_amarillo`. Para cambiarlo use variables de entorno:
```
DB_HOST=localhost DB_USER=root DB_PASSWORD=miclave DB_NAME=coquito_amarillo npm start
```
(En Windows PowerShell: `$env:DB_PASSWORD="miclave"; npm start`)

## Ejecución
```
npm start
```
Abrir http://localhost:3000

## Endpoint
`POST /registrar` con JSON `{ "nombreCliente", "producto", "cantidad", "correo" }`

| Código | Significado |
|---|---|
| 201 | Guardado en CSV y MySQL |
| 207 | Guardado en solo uno de los dos destinos |
| 400 | Datos inválidos (incluye lista de errores) |
| 500 | Error interno / no se guardó |

## Pruebas manuales realizadas
1. Registro válido → mensaje de éxito, nueva línea en `Datos.csv` y fila en `registros`.
2. Campos vacíos / correo inválido / cantidad 0 → el navegador lo bloquea.
3. Petición directa sin pasar por el navegador:
   `curl -X POST http://localhost:3000/registrar -H "Content-Type: application/json" -d "{\"nombreCliente\":\"\",\"producto\":\"x\",\"cantidad\":-1,\"correo\":\"mal\"}"` → 400 con detalles.
4. MySQL apagado → respuesta 207 (CSV ok, MySQL falló) y error en consola.
5. Verificación en MySQL: `SELECT * FROM registros;`
