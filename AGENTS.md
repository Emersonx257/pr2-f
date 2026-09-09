# Instrucciones permanentes

## Alcance y fuente

Este repositorio es el frontend; su backend hermano está en ../pr2-bnd. La especificación completa está en [docs/specification/Especificacion_y_prompts_restaurante.docx](docs/specification/Especificacion_y_prompts_restaurante.docx); su versión y hash constan en docs/specification/README.md.

Aplicar únicamente la etapa solicitada por el usuario. Los bloques del catálogo son propuestas hasta que sean activados; no implican autorización independiente de publicación. Las instrucciones explícitas del usuario prevalecen sobre estas reglas. Inspeccionar las instrucciones aplicables y conservar cambios ajenos.

## P00

Actúa como desarrollador de este sistema académico de restaurante y aplica la especificación adjunta completa. Trabaja en el repositorio disponible, inspecciona sus instrucciones y conserva cambios ajenos. Usa C# ASP.NET Core, Vue 3 con TypeScript, PostgreSQL y Arquitectura Limpia, con backend y frontend en repositorios separados. No uses Express ni SQLite, tampoco en pruebas de integración. Node solo puede participar en las herramientas del frontend.

Antes de implementar, guarda el texto literal de este mensaje en docs/ai-prompts y crea el índice si falta. Haz lo mismo con todos los mensajes posteriores, incluyendo correcciones y continuaciones. Registra contexto, adjuntos, modelo visible, fecha real, cambios, validaciones y resultado; no inventes pruebas ni prompts anteriores. Mantén la distinción entre propuesto, ejecutado y validado.

Crea AGENTS.md con estas reglas y referencias a la especificación. El historial canónico de cada mensaje debe contener su texto completo, no solo su ID. Si no tienes el documento o un contrato necesario, identifica el archivo faltante. Realiza autónomamente las decisiones menores compatibles con el alcance y documenta los supuestos; no amplíes funcionalidades sin una decisión explícita.

Al terminar cada etapa informa qué implementaste, archivos relevantes, comandos ejecutados y sus resultados, limitaciones y siguiente dependencia. No publiques secretos. No afirmes que existen repositorios remotos, despliegues o un ZIP hasta haberlos creado y verificado. Implementa solo la etapa solicitada y deja la documentación consistente.

## Reglas de implementación de la especificación

- Backend: C# con ASP.NET Core sobre .NET 10, PostgreSQL 18, EF Core/Npgsql, Identity, JWT y SignalR. Verificar y fijar versiones compatibles al implementar.
- Frontend: Vue 3, TypeScript, Vite, Router y Pinia. Token solo en memoria; Node únicamente como herramienta del frontend.
- Arquitectura: Application referencia Domain; Infrastructure referencia Application y Domain; Api referencia Application e Infrastructure para composición. Domain no depende de ASP.NET ni EF. Controladores mediante casos de uso, sin consultas directas a DbContext.
- Respetar R01 a R09 completas: cuenta abierta única por mesa, estados y propiedad, precios históricos calculados en servidor, decimal para dinero, instrucciones por línea y alergia manual.
- Bloqueo transaccional por cuenta e idempotencia al abrir cuenta, crear pedido y cobrar. Primer pago impide pedidos nuevos y cancelaciones. Cobrar requiere pedidos entregados o cancelados; pago completo cierra y libera la mesa atómicamente.
- Autorización de rol y propiedad en REST y SignalR. Notificaciones persistentes, outbox transaccional y recuperación por REST.
- No ampliar el alcance con pasarelas, facturación fiscal, inventario u otras funciones excluidas.
- No usar Express, SQLite ni sustitutos en memoria para las pruebas de integración con PostgreSQL.
- No inventar contratos, pruebas, capturas, mediciones, revisiones humanas ni entregables. Contratos versionados y compartidos entre repositorios antes de integrar.
- No guardar secretos ni publicar sin autorización vigente.

## Bitácora y cierre de cada etapa

Antes de implementar cada mensaje, crear una entrada nueva con su texto literal completo en docs/ai-prompts e incorporarla a INDEX.md. Incluir ID único, origen, estado, fecha y zona, autor, herramienta, modelo visible o no disponible, repositorio, rama, commit previo, adjuntos y versiones, técnicas, respuesta o transcripción, archivos, comandos y resultados, revisión humana, pendientes y commit de implementación.

No sobrescribir entradas históricas; correcciones y continuaciones generan nuevas entradas enlazadas. Los hashes de implementación se agregan en un registro posterior y commit documental para evitar autorreferencia. En trabajos conjuntos registrar ambos hashes. Backend conserva el índice general y cada repositorio su historial local.

Distinguir propuesto, ejecutado, validado y rechazado. Validado exige evidencia. Informar cambios, archivos, comprobaciones reales, limitaciones y siguiente dependencia. El registro ORIG-001 de la conversación que produjo la guía está pendiente: no reconstruirlo.
