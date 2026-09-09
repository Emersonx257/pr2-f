# Restaurante frontend

Repositorio del frontend del sistema de restaurante. Carpeta hermana del backend: `../pr2-bnd`.

Estado: preparación inicial de Git. La aplicación todavía no está implementada y no hay remoto configurado.

La referencia recibida es `Especificacion_y_prompts_restaurante.docx`, versión 1 del 9 de septiembre de 2026. Propone Vue 3, TypeScript, Vite, Vue Router, Pinia y el cliente oficial de SignalR. Los prompts del documento son etapas propuestas; no constituyen ejecuciones realizadas.

La interfaz prevista estará en español, con importes en quetzales y vistas para mesero, cocina, cajero y administrador. Los contratos se definirán en el backend antes de integrar las pantallas. El token de acceso se conservará únicamente en memoria.

## Conectar un remoto posteriormente

Crear un repositorio remoto vacío y ejecutar desde esta carpeta, sustituyendo URL_FRONTEND por su dirección:

```sh
git remote add origin URL_FRONTEND
git push -u origin main
```

Si el remoto ya contiene código, clonarlo en otra carpeta y revisar cómo integrar ambos historiales. No sobrescribir esta carpeta ni forzar un push.
