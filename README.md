# FullstackLogisticWrk

---

## Installation & Deployment Guide

### Prerequisites

Before starting, ensure you have installed:

- **Node.js** (v18 or higher) and npm
- **Docker**
- **Git**

### Initial Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd fullstack-logistic-wrk
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

Copy the example environment files and update them with your values:

1. In the root global `.env`.
2. For the api `apps/api/.env`.
3. Db config `packages/prisma/.env`.

**Important**: Update the following variables in your `.env` files:

- `JWT_SECRET` - Change to a secure random string
- `SUPERVISOR_PASSWORD` - Change to a strong password
- `POSTGRES_USER` - Database user (default: `logistic_user`)
- `POSTGRES_PASSWORD` - Database password (change from default)
- `POSTGRES_DB` - Database name (default: `fullstack_logistic`)
- `DATABASE_URL` - PostgreSQL connection string

#### 4. Setup Prisma Client

```bash
npm run prisma:generate
```

---

### Development Environment

#### Start PostgreSQL Container

```bash
# Start the PostgreSQL database in the background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f postgre

# Stop the database
docker-compose -f docker-compose.dev.yml down

# Stop and remove volume (reset database)
docker-compose -f docker-compose.dev.yml down -v
```

#### Seed Database

```bash
npm run prisma:seed
```

---

### Running the Application

#### Development Mode (Recommended)

Start both API and Web applications together. The web app automatically depends on the API:

```bash
# Start web application (automatically starts API as dependency)
nx serve web

# The application will be available at:
# - Web: http://localhost:4200
# - API: http://localhost:3000
```

#### Individual Applications

**Start API only:**

```bash
nx serve api
# Available at: http://localhost:3000
```

**Start Web only (requires API running separately):**

```bash
nx serve web
# Available at: http://localhost:4200
# Note: Requires API running on port 3000
```

---

### Build Commands

#### Build for Production

```bash
# Build all applications
nx build

# Build specific application
nx build api
nx build web

# Build with production configuration
nx build api --configuration=production
nx build web --configuration=production
```

Output is generated in the `dist/` directory.

#### View Build Artifacts

```bash
ls -la dist/
```

---

### Testing & Linting

#### Run Tests

```bash
# Run all unit tests
nx test

# Run tests for specific app
nx test api
nx test web

# Run with code coverage
nx test --coverage

# Run in watch mode
nx test --watch
```

#### Linting

```bash
# Lint all projects
nx lint

# Lint specific project
nx lint api
nx lint web

# Fix linting issues automatically
nx lint api --fix
```

#### Code Format

```bash
# Format code
npm run format

# Check format without changing files
npm run format:check
```

---

### Useful NX Commands

#### View Project Graph

```bash
# View dependency graph for all projects
nx graph

# View dependency graph for specific project
nx graph --focus=api
```

#### Check Affected Projects

```bash
# Show which projects are affected by changes
nx affected:graph
```

---

### Quick Start Checklist

- [ ] Clone repository and `npm install`
- [ ] Copy `.env` files and update secrets
- [ ] Run `docker-compose -f docker-compose.dev.yml up -d`
- [ ] Run `npm run prisma:migrate:dev` or `npm run prisma:migrate:reset`
- [ ] Run `nx serve web`
- [ ] Access web at http://localhost:4200

---

## Objetivos

- [ ] API Rest con NestJS y PostgreSQL
  - [x] Autenticación por roles con JWT
  - [x] Gestión de envíos
  - [x] Tracking publico de envíos
  - [x] Asignación de carga
  - [ ] Swagger\*
- [ ] Front angular
  - [x] Login
  - [x] Registro
  - [x] Envíos
    - [ ] Exportar a csv\*
  - [x] Detalle envío
  - [x] Tracking publico
  - [x] Asignación de vehículos\*
  - [ ] Dashboard supervisor\*
- [ ] Docker compose\*
  - [x] Dev
  - [ ] Prod
- [ ] GitHub actions (lint y test)\*

## Decisiones

- En un primer momento pensé en crear el monorepo con turborepo por costumbre, pero al encontrar algunas dificultades integrando nestjs con angular, cambié a nx como gestor.
- Uso Prisma por familiaridad y por su gran experiencia de desarrollo junto a PostgreSQL.
- Implemeta un RBAC por simplicidad, ya que el control de acceso necesario es muy basico
- Implemeto una maquina de estados para envios. Flexibilidad y mantenibilidad con el flujo definido en una constante.
