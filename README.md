# Restaurante Frontend (pr2-f)

Sistema de frontend interactivo para gestión de restaurante académico, construido con **Vue 3, TypeScript, Vite, Vue Router y Pinia**.

Conectado en tiempo real con la API REST y SignalR Hub del backend (`pr2-bnd`).

## 🚀 Tecnologías

- **Vue 3** (Composition API, `<script setup lang="ts">`)
- **TypeScript** (Tipado estricto)
- **Pinia** (Gestión de estado global y sincronización API)
- **Vite** (Build tool y servidor de desarrollo)
- **@microsoft/signalr** (Notificaciones y eventos en tiempo real)

## 🔐 Autenticación y Seguridad

- **Token JWT en memoria**: Conforme a la arquitectura del sistema, el token de autenticación se conserva exclusivamente en memoria.
- **Roles soportados**:
  - `Admin`: Gestión completa (mesas, menú, pedidos, cobros).
  - `Waiter`: Apertura de cuentas, creación de pedidos, entrega.
  - `Kitchen`: Visualización de comanda y cambio de estados (En preparación, Listo).
  - `Cashier`: Registro de pagos y cierre de cuentas.

## 🛠️ Ejecución Local

### Prerrequisitos
- Node.js 20+ y npm.
- Backend en ejecución en `http://localhost:5214` (repositorio hermano `pr2-bnd`).

### Comandos

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilación de producción y typecheck
npm run build

# Pruebas unitarias
npm test
```

El servidor Vite levantará en `http://localhost:5173` (o `http://127.0.0.1:5175`).

## 🔗 Endpoints consumidos mediante Proxy Vite

- `POST /api/v1/auth/login`: Autenticación de usuarios.
- `GET /api/v1/tables`: Lista de mesas y estado.
- `GET /api/v1/menu-items`: Catálogo de platillos.
- `POST /api/v1/sessions`: Apertura de cuentas por mesa.
- `POST /api/v1/sessions/{id}/orders`: Envío de pedidos a cocina.
- `POST /api/v1/orders/{id}/(start|ready|deliver|cancel)`: Flujo de cocina y entrega.
- `POST /api/v1/sessions/{id}/payments`: Registro de pagos con vuelto.
- `WS /hubs/restaurant`: Suscripción SignalR a eventos del restaurante.

## 📁 Repositorios
- Frontend: [https://github.com/Emersonx257/pr2-f](https://github.com/Emersonx257/pr2-f)
- Backend: [https://github.com/Emersonx257/pr2-bnd](https://github.com/Emersonx257/pr2-bnd)
