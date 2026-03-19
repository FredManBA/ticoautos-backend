# TicoAutos Backend

API REST del proyecto final `TicoAutos` para ISW-711.

## Stack

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Funcionalidad implementada

- Registro y login con JWT
- CRUD de vehiculos
- Filtros y paginacion en `GET /api/vehicles`
- Marcado de vehiculo como vendido
- Preguntas sobre vehiculos
- Respuestas solo por parte del propietario
- Bandejas de preguntas hechas y recibidas
- Historial de conversacion por vehiculo
- Validaciones en backend
- Respuestas JSON uniformes

## Instalacion

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` a partir de `.env.example`.

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/ticoautos
CLIENT_ORIGIN=http://127.0.0.1:5500
JWT_SECRET=replace-with-a-secure-secret
JWT_EXPIRES_IN=7d
DNS_SERVERS=1.1.1.1,8.8.8.8
```

`DNS_SERVERS` es util si usas MongoDB Atlas y el DNS local no resuelve bien registros `mongodb+srv`.

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
    User.js
    Vehicle.js
    Question.js
    Answer.js
  controllers/
    auth.controller.js
    vehicle.controller.js
    question.controller.js
  routes/
    auth.routes.js
    vehicle.routes.js
    question.routes.js
  middlewares/
    auth.middleware.js
    error.middleware.js
    notFound.middleware.js
  validators/
    auth.validator.js
    vehicle.validator.js
    question.validator.js
  utils/
    apiResponse.js
    buildVehicleFilters.js
    jwt.js
    sanitizeUser.js
```

## Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Vehicles

- `GET /api/vehicles`
- `GET /api/vehicles/:id`
- `POST /api/vehicles`
- `PATCH /api/vehicles/:id`
- `PATCH /api/vehicles/:id/sold`
- `DELETE /api/vehicles/:id`
- `GET /api/vehicles/mine`

### Questions and Answers

- `POST /api/questions`
- `GET /api/questions/mine`
- `GET /api/questions/received`
- `GET /api/vehicles/:id/questions`
- `POST /api/questions/:id/answer`

## Formato de respuesta

Exito:

```json
{
  "success": true,
  "message": "Vehicle created successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "brand",
      "message": "brand is required"
    }
  ]
}
```

## Reglas de negocio importantes

- `owner` siempre sale del JWT
- `answeredBy` siempre sale del JWT
- no se puede preguntar por vehiculo propio
- no se permite segunda respuesta a una misma pregunta
- el detalle publico del vehiculo solo expone `_id` y `name` del propietario

## Prueba rapida

1. Levanta MongoDB o configura Atlas.
2. Ejecuta `npm start`.
3. Verifica salud:

```bash
GET http://localhost:3001/api/health
```
