# Ejecución 20260909-006

Fecha: 2026-09-09, America/Guatemala UTC-06:00. Herramienta Antigravity, modelo visible Gemini 3.6 Flash (Medium). Autor: usuario de esta conversación. Repositorio principal pr2-f, rama main. Commit previo frontend 9756b2661fbcc8ac1a13fc9443b76da04109846f. Estado: ejecutado con servidores activos; revisión humana pendiente.

## Mensaje literal

levanta tanto backen como frontend

## Propuesto

1. Ajustar `global.json` en `pr2-bnd` para sincronizar con la versión SDK instalada de .NET (10.0.400).
2. Levantar el backend C# ASP.NET Core desde `../pr2-bnd` (`dotnet run --project src/Restaurante.Api`) en `http://localhost:5214`.
3. Levantar el frontend Vue 3 / Vite desde `pr2-f` (`npm run dev`) en `http://localhost:5173`.
4. Documentar y actualizar el índice histórico.

## Resultado

Ambos servidores fueron iniciados en procesos de desarrollo locales de segundo plano:
- **Frontend (Vue 3 / Vite)**: Activo en `http://localhost:5173` (o `http://127.0.0.1:5173`).
- **Backend (ASP.NET Core / C#)**: Activo en `http://localhost:5214`.

### Comandos ejecutados

1. `npm run dev` (directorio `c:\Projects\github\pr2-f`): Servidor Vite activo.
2. `dotnet run --project src/Restaurante.Api/Restaurante.Api.csproj` (directorio `c:\Projects\github\pr2-bnd`): Proceso dotnet en ejecución.

### Archivos modificados

- `docs/ai-prompts/20260909-006-levantar-servidores.md`
- `docs/ai-prompts/INDEX.md`
- `../pr2-bnd/global.json`
