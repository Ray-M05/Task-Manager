# Plan por Sprints — Mini‑Jira (Angular + JSON Server Auth)

Este documento organiza el proyecto en **sprints** (entregables cortos) para avanzar rápido.  
En cada sprint verás:

- **Entregable**: lo que debe quedar funcionando al final.
- **Qué se hará**: tareas concretas.
- **Necesario**: dependencias, archivos o configuraciones mínimas.
- **Aprenderás**: conceptos Angular (comparables con React cuando aplique).

---

## Visión general del MVP (lo mínimo viable)

### Pantallas
1. **Login**
2. **Tareas**: tabla + filtros + CRUD + cambio de estado
3. **Usuarios**: tabla + filtros + CRUD (**solo Admin**)
4. (Recomendado) **Layout** con toolbar/sidenav (Material)

### Reglas clave
- **Admin**: ve todas las tareas, puede asignarlas.
- **User**: ve solo sus tareas.
- **Filtros obligatorios**:
  - Tareas: **nombre** + **estado**
  - Usuarios: **nombre** + **rol**

---

## Sprint 0 — Arranque (Angular + SSR + PWA + Material)

### Entregable
Proyecto creado con:
- **SSR** habilitado
- **PWA** habilitada
- **Angular Material** instalado
- Estructura base lista para agregar rutas/páginas

### Qué se hará
- Crear proyecto Angular (standalone + routing + scss).
- Añadir SSR (si no se creó con SSR desde el inicio).
- Instalar Angular Material y elegir tema.
- Añadir PWA (service worker + manifest).
- Crear layout base (shell) y rutas vacías.

### Necesario
- Node + Angular CLI
- Comandos sugeridos:
  ```bash
  ng new mini-jira --standalone --routing --style=scss --ssr
  cd mini-jira
  ng add @angular/material
  ng add @angular/pwa
  ```

### Aprenderás
- Cómo “piensa” Angular CLI (vs Vite/CRA).
- Standalone components y routing moderno.
- SSR/PWA a nivel de proyecto (sin drama).

---

## Sprint 1 — API Mock (json-server + json-server-auth)

### Entregable
Backend falso con:
- Registro/login con **JWT**
- Endpoints para **users** y **tasks**
- Reglas básicas de acceso (mínimo: “público no entra”)

### Qué se hará
- Crear `db.json` con colecciones `users` y `tasks`.
- Configurar `json-server` + `json-server-auth`.
- Crear scripts en `package.json` para levantar la API.
- Probar login/registro con Postman/Thunder Client.

### Necesario
- Dependencias (npm):
  ```bash
  npm i -D json-server json-server-auth
  ```
- Archivos:
  - `db.json`
  - (Opcional) `routes.json` para permisos

### Aprenderás
- Qué es un mock API “suficiente” para desarrollar.
- Qué es JWT y cómo viaja en `Authorization: Bearer <token>`.

---

## Sprint 2 — Auth en Angular (Service + Interceptor + Guards)

### Entregable
- Login funcional en Angular
- Token almacenado (localStorage o sessionStorage)
- Usuario actual disponible en un servicio (`AuthService`)
- Guard de rutas:
  - bloquea acceso si no hay sesión
  - (base) redirige a `/login`

### Qué se hará
- Crear `AuthService` con:
  - `login()`, `logout()`, `register()` (si aplica)
  - `currentUser$` (Observable)
- Crear `AuthInterceptor` para adjuntar token a cada request.
- Crear `AuthGuard` para rutas protegidas.
- Implementar pantalla de login con Reactive Forms.

### Necesario
- `HttpClient` habilitado (providers).
- Rutas:
  - `/login`
  - `/tasks` (protegida)
  - `/users` (protegida + rol)

### Aprenderás
- Servicios + DI (equivalente mental a “hooks + context”, pero Angular).
- Interceptors (la forma elegante de “no repetir token en cada fetch”).
- Guards (route protection de Angular).

---

## Sprint 3 — UI base con Angular Material (tablas + filtros)

### Entregable
- Layout (toolbar/sidenav)
- Tabla de tareas con:
  - filtro por **nombre** y **estado**
  - paginación/sort (opcional pero recomendado)

### Qué se hará
- Crear `ShellComponent` (layout).
- Crear página `TasksPage` con `MatTable`.
- Implementar filtros:
  - input (nombre)
  - select (estado)
- Conectar tabla con API (GET tasks).

### Necesario
- Imports de Angular Material:
  - MatToolbar, MatSidenav, MatIcon, MatButton
  - MatTable, MatPaginator, MatSort
  - MatFormField, MatInput, MatSelect

### Aprenderás
- `MatTableDataSource` y `filterPredicate` (filtros multi-campo).
- Estructurar componentes “contenedor vs presentacional”.

---

## Sprint 4 — CRUD de Tareas + Estados + Asignación

### Entregable
- Crear/editar/eliminar tareas
- Cambiar estado: pendiente / en progreso / completada
- Admin puede asignar tarea a un usuario
- User solo ve sus tareas

### Qué se hará
- Crear `TasksService` con CRUD:
  - `getTasks()`, `createTask()`, `updateTask()`, `deleteTask()`
- Formularios con **Reactive Forms**:
  - create/edit (ideal con `MatDialog`)
- Lógica de rol:
  - si Admin: muestra columna “asignado a”
  - si User: filtra por `userId` del usuario logueado
- Validaciones mínimas:
  - nombre requerido
  - estado requerido

### Necesario
- Modelos TS:
  - `Task { id, title/name, description, status, userId/assigneeId, ... }`
  - `User { id, name, email, role, ... }`
- Material Dialog si usas modales.

### Aprenderás
- Reactive Forms y validaciones.
- `MatDialog` para CRUD rápido y prolijo.
- Control de UI por rol (mostrar/ocultar acciones).

---

## Sprint 5 — CRUD de Usuarios (solo Admin) + Filtros

### Entregable
- Página de usuarios visible solo para **Admin**
- Tabla con filtros por **nombre** y **rol**
- Crear/editar/eliminar usuarios

### Qué se hará
- Crear `UsersService` con CRUD.
- Crear `AdminGuard` (o guard con roles).
- UI:
  - tabla
  - filtros por nombre/rol
  - modal create/edit

### Necesario
- Roles definidos (mínimo): `admin` / `user`
- Guard de rol + verificación en templates.

### Aprenderás
- Guards por rol (autorización).
- Diseño de permisos en frontend (y cómo no “romper” UX).

---

## Sprint 6 — Pulido final (SSR + PWA + Checklist de entrega)

### Entregable
- SSR funcionando (build/serve SSR)
- PWA funcionando (service worker activo en producción)
- App estable:
  - rutas protegidas
  - manejo básico de errores
  - navegación clara

### Qué se hará
- Verificar SSR:
  - build/serve sin errores
  - revisar que llamadas a `window`/`localStorage` estén protegidas (SSR no tiene DOM).
- Verificar PWA:
  - `ng build --configuration production`
  - servir dist en servidor estático y revisar instalación.
- Añadir mejoras:
  - snackbar de éxito/error
  - loading states
  - manejo de 401 (logout automático)

### Necesario
- Builds y scripts listos en `package.json`.
- Evitar APIs del navegador directas en SSR (o usar guards/abstracciones).

### Aprenderás
- Qué rompe SSR (y cómo evitarlo).
- Service worker y caching básico.
- “Hardening” de app para entrega.

---

## Definition of Done (DoD) — Checklist de aceptación

- [ ] Login funciona y bloquea rutas sin sesión.
- [ ] Admin ve todas las tareas; User ve solo las suyas.
- [ ] CRUD tareas completo + cambio de estado.
- [ ] CRUD usuarios (solo Admin).
- [ ] Filtros:
  - [ ] tareas: nombre + estado
  - [ ] usuarios: nombre + rol
- [ ] Angular Material usado en UI (tablas/forms/layout).
- [ ] API mock levantable con un comando.
- [ ] SSR habilitado y no rompe navegación.
- [ ] PWA habilitada y construye en producción.

---

## “React → Angular” (traducción mental rápida)

- **Component + props** → **Component + @Input/@Output**
- **Context / Zustand / Redux** → **Services + DI + Observables**
- **fetch/axios** → **HttpClient + Interceptor**
- **Route protection** → **Guards**
- **useEffect** → **ngOnInit + Observables + async pipe**
- **Form libraries** → **Reactive Forms**

---

## Orden recomendado

1) Sprint 0 (setup)  
2) Sprint 1 (API mock)  
3) Sprint 2 (auth)  
4) Sprint 3 (UI + tabla + filtros)  
5) Sprint 4 (tareas completas)  
6) Sprint 5 (usuarios admin)  
7) Sprint 6 (SSR/PWA checklist final)
