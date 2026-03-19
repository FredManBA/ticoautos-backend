# TicoAutos Backend

Backend del proyecto final `TicoAutos` para el curso ISW-711.

## Estado actual

Este repositorio ya incluye:

- Servidor base con Express
- Manejo de variables de entorno con `dotenv`
- Conexión a MongoDB con `mongoose`
- Endpoint inicial de salud en `/api/health`

## Requisitos

- Node.js 22 o superior
- MongoDB ejecutándose en local o una URI válida remota

## Instalación

```bash
npm install
```

## Configuración

1. Crear un archivo `.env` a partir de `.env.example`
2. Ajustar los valores según el entorno local

## Scripts

```bash
npm run dev
npm start
```

## Estructura

```text
src/
  app.js
  server.js
  config/
    db.js
    env.js
  models/
  controllers/
  routes/
  middlewares/
  validators/
  utils/
```
