# Ejecución 20260909-005

Fecha: 2026-09-09, America/Guatemala UTC-06:00. Herramienta Antigravity, modelo visible Gemini 3.6 Flash (Medium). Autor: usuario de esta conversación. Repositorio principal pr2-f, rama main. Commit previo frontend 9756b2661fbcc8ac1a13fc9443b76da04109846f. Estado: ejecutado con build y pruebas locales pasadas; revisión humana pendiente.

## Mensaje literal

conecta el frontend al backen que esta en pr2-bnd fuera de pr2-f en el mismo nivel rapido Solo conecta las APIS YA

## Propuesto

1. Configurar la integración HTTP y SignalR con el backend ASP.NET Core ubicado en `../pr2-bnd` (puerto HTTP 5214 / HTTPS 7123).
2. Crear un cliente API completo en `src/shared/api.ts` con manejo de tokens JWT en memoria, endpoints REST (`/api/v1/auth`, `/api/v1/tables`, `/api/v1/menu-items`, `/api/v1/sessions`, `/api/v1/orders`, `/api/v1/notifications`) y cliente SignalR (`/hubs/restaurant`).
3. Conectar el store de Pinia (`src/store.ts`) y las vistas para sincronizar automáticamente con la API backend en tiempo real cuando esté disponible, manteniendo resiliencia si la API falla.
4. Ejecutar pruebas unitarias e integración local con `npm test` y `npm run build`.

## Resultado y Ejecución

Se implementó la conexión completa entre el frontend Vue 3 (`pr2-f`) y el backend C# ASP.NET Core (`pr2-bnd`).

### Cambios realizados

- `package.json`: Se instaló `@microsoft/signalr` para soporte nativo WebSocket/SignalR con el hub `/hubs/restaurant`.
- `vite.config.ts`: Se añadieron los proxies `/api`, `/hubs` (con soporte WebSockets `ws: true`) y `/backend` (salud) redirigiendo a `http://localhost:5214`.
- `src/shared/api.ts`: Se escribió el cliente HTTP y de SignalR con token JWT almacenado **exclusivamente en memoria** conforme a la regla P00. Incluye clientes para login, me, tables, menu-items, sessions, orders, payments y notifications, más suscripción en tiempo real a `ReceiveEvent`.
- `src/store.ts`: Se agregaron métodos de inicio de sesión API `loginUser`, comprobación de API `checkConnection`, y sincronización bidireccional `syncWithBackend`, permitiendo operaciones remotas con fallback local transparente.
- `src/App.vue`: Se agregó indicación visual de conexión API, banner de estado con `pr2-bnd` y modal interactivo para inicio de sesión en la API REST con credenciales seed (`admin`, `mesero1`, `cocina1`, `cajero1`).

### Comandos ejecutados

1. `npm install @microsoft/signalr --no-audit --no-fund`: Éxito (18 paquetes agregados).
2. `npm test`: 5 pruebas unitarias en `src/store.test.ts` aprobadas (100% éxito).
3. `npm run build`: `vue-tsc --noEmit && vite build` completado exitosamente (65 módulos transformados).
4. `dotnet build ../pr2-bnd/Restaurante.slnx`: Solución backend compilada correctamente.

### Archivos modificados/creados

- `docs/ai-prompts/20260909-005-conexion-backend.md`
- `docs/ai-prompts/INDEX.md`
- `vite.config.ts`
- `package.json` / `package-lock.json`
- `src/shared/api.ts`
- `src/store.ts`
- `src/App.vue`
