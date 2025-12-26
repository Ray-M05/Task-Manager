# Mini Jira / Task Manager — Guía de desarrollo (Angular)

> Proyecto pensado para aprender Angular de forma intensiva (2 días) viniendo de React, enfocándose en *lo esencial para trabajar*: componentes, routing, DI, services, HttpClient, formularios reactivos, RxJS y un tablero Kanban con drag & drop.

---

## 1) Descripción del proyecto

### Objetivo
Construir una aplicación tipo **Mini Jira** (gestión de proyectos y tareas) que cubra los patrones más comunes en Angular:

- **Autenticación falsa** (login/logout) con **Guard** e **Interceptor**.
- **CRUD** de proyectos.
- **CRUD** de tareas por proyecto.
- **Tablero Kanban** (To Do / Doing / Done) con **drag & drop**.
- **Búsqueda y filtros** (RxJS + Reactive Forms).
- Manejo de **loading/error** de forma limpia usando `async` pipe.

### Qué vas a aprender “de verdad”
- Estructura **feature-first** (core/shared/features).
- **Routing** con lazy loading y rutas anidadas.
- **Services** y **DI** (inyección de dependencias) como patrón central.
- Consumo de APIs con **HttpClient** (Observables).
- **Reactive Forms** con validaciones.
- Render asíncrono con **`async` pipe** y buenas prácticas de suscripción.

### Alcance (Scope)
Incluido:
- Pantallas: Login, Lista de Proyectos, Tablero de Proyecto.
- CRUD completo de Projects/Tasks.
- Drag & drop para mover tareas de columna.
- Filtros por status/prioridad y búsqueda por texto.
- Mock de backend (JSON Server o In-Memory Web API).

No incluido (para no explotar en 2 días):
- Roles/permisos complejos.
- NgRx / arquitectura de estado avanzada (se usa store simple).
- Backend real.
- Tiempo real / websockets.
- Notificaciones y auditoría avanzada.

---

## 2) Requisitos funcionales

### Auth (falsa, pero completa)
- Login guarda un **token** en `localStorage`.
- Logout borra token.
- Un **Guard** bloquea rutas privadas si no hay token.
- Un **Interceptor** agrega `Authorization: Bearer <token>` a las requests.

### Proyectos
- Listar proyectos.
- Crear proyecto.
- Editar proyecto.
- Eliminar proyecto.
- Navegar al tablero del proyecto.

### Tareas
- Listar tareas por proyecto.
- Crear/editar/eliminar tareas.
- Cambiar status (todo/doing/done).
- Drag & drop entre columnas actualiza el status y persiste el cambio.
- Filtros y búsqueda.

---

## 3) Stack y librerías recomendadas

- **Angular** (standalone components + routing)
- **Angular Material** (UI rápida)
- **Angular CDK DragDrop** (drag & drop Kanban)
- **RxJS** (streams, búsqueda con debounce, etc.)
- Mock backend:
  - Opción A: **JSON Server**
  - Opción B: **angular-in-memory-web-api**

---

## 4) Modelos de datos (mínimo viable)

### Project
```ts
export type Project = {
  id: string;
  name: string;
  createdAt: string;
};
```

### Task
```ts
export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignee?: string;
  createdAt: string;
};
```

---

## 5) Estructura de carpetas (recomendada)

> **Feature-first** + separación clara de responsabilidades.

```txt
src/
  app/
    core/
      auth/
        auth.service.ts
        auth.guard.ts
        auth.interceptor.ts
        auth.models.ts
      http/
        api.config.ts
        http-error.service.ts
      layout/
        shell.component.ts
        shell.component.html
        shell.component.scss
      core.providers.ts
    shared/
      ui/
        confirm-dialog/
          confirm-dialog.component.ts
          confirm-dialog.component.html
        empty-state/
          empty-state.component.ts
      pipes/
        priority-label.pipe.ts
      directives/
        autofocus.directive.ts
    features/
      auth/
        login/
          login.page.ts
          login.page.html
          login.page.scss
        auth.routes.ts
      projects/
        data-access/
          projects.api.ts
          projects.store.ts
          projects.models.ts
          tasks.api.ts
          tasks.store.ts
          tasks.models.ts
        pages/
          projects-list/
            projects-list.page.ts
            projects-list.page.html
            projects-list.page.scss
          project-board/
            project-board.page.ts
            project-board.page.html
            project-board.page.scss
        components/
          project-form-dialog/
            project-form-dialog.component.ts
            project-form-dialog.component.html
          task-form-dialog/
            task-form-dialog.component.ts
            task-form-dialog.component.html
          task-card/
            task-card.component.ts
            task-card.component.html
            task-card.component.scss
        projects.routes.ts
    app.routes.ts
    app.config.ts
  assets/
  styles.scss
```

### Reglas rápidas
- **core/**: cosas globales de la app (auth, interceptors, layout base).
- **shared/**: componentes/pipes/directives reutilizables y agnósticos de negocio.
- **features/**: “negocio” por módulos/áreas (auth, projects).

---

## 6) Routing (especificación)

### Rutas principales
- `/login` → pantalla pública.
- `/app` → layout privado (Shell) + rutas hijas.

### Rutas de Projects
- `/app/projects` → lista de proyectos.
- `/app/projects/:id/board` → tablero Kanban del proyecto.

### Guard
- Todo lo que cuelgue de `/app/**` requiere token.

---

## 7) Patrón de datos recomendado (API + Store)

Para no llenar componentes de lógica:

- `XxxApi` → **solo HTTP** (get/post/put/delete).
- `XxxStore` → **estado y operaciones** (BehaviorSubject/Signals), expone `xxx$`.

Ventajas:
- Componentes más limpios.
- Estado compartido predecible.
- Fácil de testear y mantener.

---

# 8) Fases de desarrollo (paso a paso)

> Orden pensado para construir sin atascarte y maximizando aprendizaje.

## Fase 0 — Setup base
**Objetivo:** proyecto creado + UI base.

**Pasos**
1. Crear app:
   - `ng new mini-jira --standalone --routing --style=scss`
2. Agregar Angular Material:
   - `ng add @angular/material`
3. Crear `ShellComponent` (toolbar + sidenav + `<router-outlet>`).

**Entregable**
- App arranca.
- Layout básico listo.

---

## Fase 1 — Routing y lazy loading
**Objetivo:** rutas organizadas por feature.

**Pasos**
1. Crear `app.routes.ts` y rutas por feature:
   - `features/auth/auth.routes.ts`
   - `features/projects/projects.routes.ts`
2. `/login` público.
3. `/app` privado con children.

**Entregable**
- Navegación funcionando.
- Rutas separadas por features.

---

## Fase 2 — Auth falsa (Service + Guard + Interceptor)
**Objetivo:** flujo de autenticación realista (sin backend real).

**Pasos**
1. `AuthService`:
   - `login()` guarda token.
   - `logout()` borra token.
   - `isLoggedIn()` revisa token.
2. `AuthGuard`:
   - si no hay token → redirige a `/login`.
3. `AuthInterceptor`:
   - agrega `Authorization` a requests.
   - opcional: manejar 401.

**Entregable**
- `/app/**` protegido.
- Requests incluyen token.

---

## Fase 3 — Data layer de Projects (API + Store)
**Objetivo:** separar HTTP y estado.

**Pasos**
1. `ProjectsApi` con `HttpClient`:
   - `getAll()`, `create()`, `update()`, `delete()`.
2. `ProjectsStore`:
   - `projects$` (BehaviorSubject/Signals).
   - `load()`, `add()`, `edit()`, `remove()`.

**Entregable**
- `ProjectsListPage` muestra proyectos con `async` pipe.

---

## Fase 4 — CRUD de Proyectos (Dialog + Reactive Forms)
**Objetivo:** forms pro y UX rápida con Material.

**Pasos**
1. `ProjectFormDialogComponent`:
   - `FormGroup` con validaciones (required, minLength).
2. `ProjectsListPage`:
   - abrir dialog para create/edit.
   - eliminar con confirm dialog.

**Entregable**
- CRUD completo de Projects desde UI.

---

## Fase 5 — Tasks: API + Store por proyecto
**Objetivo:** tareas por proyecto y operaciones base.

**Pasos**
1. `TasksApi`:
   - `getByProject(projectId)`
   - `create(task)`, `update(task)`, `delete(id)`
2. `TasksStore`:
   - `tasks$`
   - `loadByProject(projectId)`
   - `moveTask(id, newStatus)`

**Entregable**
- Tareas cargan por proyecto y se actualizan desde UI.

---

## Fase 6 — Tablero Kanban (Drag & Drop)
**Objetivo:** tablero tipo Jira.

**Pasos**
1. `ProjectBoardPage`:
   - dividir tareas por status: todo/doing/done.
2. CDK DragDrop:
   - arrastrar tarjeta entre columnas.
3. Persistencia:
   - al soltar → `moveTask()` + `TasksApi.update()`.

**Entregable**
- Kanban funcional con persistencia.

---

## Fase 7 — Búsqueda, filtros y UX
**Objetivo:** hacer la app “usable” y practicar RxJS.

**Pasos**
1. `FormControl` para búsqueda.
2. `valueChanges` + `debounceTime` + `distinctUntilChanged`.
3. Filtros por prioridad/status.
4. Estados de UI:
   - loading, empty-state, error.

**Entregable**
- Búsqueda suave, filtros, UX de app real.

---

## Fase 8 — Pulido y extras (si sobra tiempo)
- Resolver (precargar datos por ruta).
- Pipes custom (priority label).
- Tests básicos de services.
- Mejoras visuales (chips, badges, skeletons).

---

# 9) Especificaciones UI (Angular Material)

Componentes sugeridos:
- `MatToolbar`, `MatSidenav`, `MatList` (layout)
- `MatTable` o `MatCard` (lista de proyectos)
- `MatDialog` (formularios create/edit)
- `MatFormField` + `MatInput` + `MatSelect`
- `MatChips` (prioridad/status)
- `MatSnackBar` (feedback)
- `CdkDragDrop` (kanban)

---

# 10) Convenciones y buenas prácticas (rápidas y útiles)

- Variables `Observable` terminan con `$` (`projects$`, `tasks$`).
- Preferir `async` pipe en template sobre `subscribe()` en componente.
- Con `ChangeDetectionStrategy.OnPush`, evitar mutar objetos/arrays; usar inmutabilidad.
- Lógica de negocio en services/stores, componentes más “UI wiring”.
- `trackBy` en listas grandes o reordenables.
- Manejar errors con `catchError` en API service y mostrar feedback en UI.

---

# 11) Checklist de entregables (para saber si “ya aprendiste”)

✅ Arquitectura
- [ ] feature-first (core/shared/features)
- [ ] routing con lazy loading
- [ ] guard de auth
- [ ] interceptor

✅ Datos
- [ ] HttpClient en services
- [ ] estado con store simple + async pipe
- [ ] CRUD Projects
- [ ] CRUD Tasks

✅ UI/UX
- [ ] dialogs + reactive forms
- [ ] kanban drag & drop
- [ ] búsqueda con debounce
- [ ] loading/error/empty

---

## 12) Siguiente paso recomendado
Cuando termines este proyecto, el “upgrade natural” es:
- Cambiar el mock por un backend real (Supabase/Firebase).
- Añadir roles y permisos.
- Migrar store simple a Signals (o NgRx si el proyecto crece).

---

**Fin.**
Si quieres, puedo darte una plantilla inicial con `app.routes.ts`, `AuthService/Guard/Interceptor`, y `ProjectsApi/Store` para empezar codeando con un esqueleto listo.
