# Heinrich Admisión

Base Modernize `packages/main`, conservando su estructura de carpetas y componentes.

## Desarrollo

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
```

- Entrada: `/auth/login`. Inicio: `/dashboards/modern`.
- Acceso de demostración: acepta cualquier usuario y contraseña, incluso campos vacíos. La sesión vive en `sessionStorage`, con clave propia, sin guardar contraseñas ni llamar a servicios externos. Recargar conserva la sesión en esa pestaña; cerrar sesión la elimina.
- No hay autenticación ni autorización real: integrar la API antes de usar datos reales.
- Validación: `npm run build` (TypeScript y compilación).

## Identidad visual

`src/theme/HeinrichTheme.ts` reproduce los tokens activos del WebFront: rojo `#de2826`, secundario `#49BEFF`, información `#009BFF`, éxito `#50cd89`, advertencia `#f0b100`, error `#f1416c`, fondos y colores de texto. Se omiten las paletas históricas del archivo de referencia.

La paleta del menú proviene de `src/scss/layout/_sidebar.scss` del WebFront. Se mantienen Plus Jakarta Sans, radio base de 7 px, sombras, ancho máximo de 1200 px y encabezado de 70 px. El menú usa 296 px, como la referencia. Logo y favicon se copiaron desde el WebFront sin modificarlo.

## Infraestructura compartida

- `src/stores/notification.ts`: notificaciones de éxito, información, alerta y error; y confirmaciones asíncronas mediante `await notificationStore.confirm('¿Continuar?')`.
- `src/components/notification/AppNotification.vue`: host global de notificaciones y confirmaciones. Ya está montado en `App.vue`.
- `src/components/shared/UiModal.vue`: modal reutilizable con título, carga, acciones y control con `v-model:show`.
- `src/utils/axios.ts`: cliente HTTP único. Añadirá `Authorization: Bearer` cuando el futuro API entregue una sesión real y cerrará esa sesión ante 401 o 403.
- `src/router/index.ts`: guard que protege las rutas con `meta.requiresAuth` y conserva el destino para volver después del ingreso.
- `src/stores/auth.ts`: sesión local de demostración en `sessionStorage`; incluye el punto `establishApiSession()` para conectar la respuesta real del API sin guardar contraseñas.
- `src/utils/validation.ts`: reglas reutilizables de formularios en español.

La maqueta sigue aceptando cualquier usuario y contraseña. Los interceptores HTTP no envían el token local de demostración y no hacen peticiones por sí solos.

## Ejemplos conservados

Los menús y rutas de tienda, aplicaciones, gráficos, widgets, páginas promocionales y variantes de autenticación están comentados en sus archivos originales. También están comentadas sus entradas visibles en el encabezado, los widgets del dashboard, los selectores de tema y los registros globales que no se usan. No se movieron ni eliminaron carpetas, vistas ni dependencias de la plantilla.

Para reutilizar un ejemplo, reactivar conjuntamente su ruta, entrada de menú y, si corresponde, sus plugins, estilos y datos simulados en `src/main.ts` y `src/scss/style.scss`. Los componentes se conservan, pero no hay módulos funcionales de admisión implementados todavía.
