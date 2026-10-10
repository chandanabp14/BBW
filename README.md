# BBW Template - Full-Stack Architecture

Production-ready Checklist Builder and Inspection System built with Angular 21 (Frontend) and Express / Node.js / MongoDB (Backend).

---

## Workspace Structure

```
bbw_template/
│
├── frontend/                     # Angular Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/            # App-wide singleton services, guards, interceptors, core models
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── services/
│   │   │   │   └── models/
│   │   │   │
│   │   │   ├── shared/          # Reusable components, directives, pipes, shared models
│   │   │   │   ├── components/
│   │   │   │   ├── directives/
│   │   │   │   ├── pipes/
│   │   │   │   └── models/
│   │   │   │
│   │   │   ├── modules/         # Feature modules
│   │   │   │   └── template-builder/
│   │   │   │       ├── components/  # Builder UI components (canvas, navbar, sidebar, properties, footer, etc.)
│   │   │   │       ├── models/      # Template builder data models
│   │   │   │       └── services/    # Template, Table, MasterConfig, Inspection, Validation services
│   │   │   │
│   │   │   ├── pages/           # Application views / page level components
│   │   │   │   ├── builder/
│   │   │   │   ├── checklists/
│   │   │   │   ├── inspection/
│   │   │   │   ├── master-config/
│   │   │   │   ├── preview/
│   │   │   │   └── published-template/
│   │   │   │
│   │   │   ├── app.ts
│   │   │   ├── app.html
│   │   │   ├── app.css
│   │   │   ├── app.routes.ts
│   │   │   └── app.config.ts
│   │   │
│   │   ├── assets/              # Static assets (images, icons)
│   │   ├── environments/        # Environment configurations
│   │   ├── index.html
│   │   ├── main.ts
│   │   ├── material-theme.scss
│   │   └── styles.css
│   │
│   ├── public/                  # Public static files
│   ├── angular.json
│   ├── package.json
│   └── tsconfig*.json
│
├── backend/                      # Node.js / Express API Backend
│   ├── src/
│   │   ├── config/              # DB & env configuration (db.js)
│   │   ├── controllers/         # Request handlers (template, inspection, master-config)
│   │   ├── routes/              # Express API endpoints
│   │   ├── services/            # Business logic layer
│   │   ├── models/              # Mongoose DB schemas
│   │   ├── middleware/          # Express middleware (auth, body-parsers)
│   │   ├── validators/          # Input schema validators
│   │   ├── utils/               # Helper utilities
│   │   ├── types/               # Type declarations
│   │   └── app.js               # Express application entry point
│   │
│   ├── package.json
│   └── .env
│
├── package.json                 # Workspace root package runner
└── README.md                    # Project documentation
```

---

## Quick Start

### 1. Frontend Development

```bash
# From root
npm run start:frontend

# Or directly in frontend folder
cd frontend
npm start
```
The frontend will run at `http://localhost:4200/`.

### 2. Backend Development

```bash
# From root
npm run start:backend

# Or directly in backend folder
cd backend
npm run dev
```
The API server will run at `http://localhost:3000/`.

---

## Building for Production

### Build Frontend
```bash
npm run build
```
Compiled bundle output will be saved in `frontend/dist/frontend`.
