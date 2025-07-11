# Kanban App

Aplicación web de gestión de tareas colaborativas estilo tablero Kanban.

## Stack Utilizado

- **Backend:** Node.js + Express + TypeScript
- **ORM:** Sequelize (soporte MySQL)
- **Base de Datos:** MySQL
- **Frontend:** React + Vite + TypeScript (modo estricto)
- **Gestión de Estado:** Zustand
- **Estilos:** SCSS modular
- **Drag & Drop:** dnd-kit
- **Autenticación:** JWT

## Estructura de Carpetas

```
/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── dtos/
│   │   ├── services/
│   │   ├── middlewares/
│   │   └── index.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── types/
│   │   ├── context/
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone <REPO_URL>
cd kanban-app
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env # O crea tu propio .env
# Edita las variables de entorno según tu MySQL
npm run build
npm run dev
```

### 3. Frontend

```bash
cd ../frontend
npm install
npm run build
npm run dev
```

La app estará disponible en `http://localhost:5173` (frontend) y el backend en `http://localhost:4000`.

### 4. Base de datos

Ejecuta el script `DB_MySQL.sql` para crear la base de datos.


## Decisiones Técnicas

- **Zustand** se eligió por su simplicidad y rendimiento para estado global, evitando la complejidad de Redux.
- **dnd-kit** se usa para drag & drop moderno y compatible con React 19.
- **Arquitectura modular**: separación clara de controladores, servicios, modelos y rutas en backend; hooks, servicios y componentes en frontend.
- **Tipado estricto**: todo el código usa TypeScript en modo estricto para máxima seguridad y mantenibilidad.
- **SCSS modular**: los estilos son encapsulados por componente, evitando conflictos globales.

## Notas

- El backend requiere una instancia de MySQL accesible y configurada en `.env`.
- El frontend espera la URL del backend en la variable `VITE_API_URL`.
- El sistema soporta múltiples usuarios y JWT real para proteger rutas.

## TODO

- Refactorizar código.
- Mejorar funcionalidades y ordenamiento de Drag & Drop en columnas y tareas.
- Mejorar estilos de la aplicación.
- Realizar Tests unitarios y/o de integración.
- Deploy en plataformas como Vercel (frontend) y Render/Railway (backend).
- CI/CD básico con GitHub Actions