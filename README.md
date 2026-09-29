# Task Manager REST API

A complete authenticated CRUD REST API built with **Node.js, Express, SQLite, JWT and bcryptjs**.

## What it demonstrates

- User registration and login
- Bcrypt password hashing (no plaintext password storage)
- JWT authentication with Bearer tokens
- Protected CRUD endpoints
- Per-user task ownership and `403 Forbidden` checks
- Input validation using Zod
- Correct HTTP status codes
- SQLite persistence
- Postman collection for testing

## Tech Stack

Node.js · Express · SQLite (`better-sqlite3`) · JWT · bcryptjs · Zod

## Run locally

```bash
npm install
```

Copy `.env.example` to `.env` and set a strong `JWT_SECRET`.

```bash
npm start
```

Development mode:

```bash
npm run dev
```

API base URL: `http://localhost:3000`

## Data model

### users
- `id`
- `name`
- `email` (unique)
- `password_hash`
- `created_at`

### tasks
- `id`
- `user_id`
- `title`
- `description`
- `status` (`pending`, `in_progress`, `completed`)
- `due_date` (`YYYY-MM-DD` or null)
- `created_at`
- `updated_at`

# API Reference

All routes below are relative to `http://localhost:3000`.
Protected routes require:

```http
Authorization: Bearer <JWT_TOKEN>
```

## `GET /health`

Authentication: none

Success `200`:

```json
{"success":true,"message":"Task Manager API is running.","timestamp":"2026-09-27T10:00:00.000Z"}
```

## `POST /api/auth/register`

Authentication: none

Request body:

```json
{"name":"Pratik Pawar","email":"pratik@example.com","password":"StrongPass123"}
```

Success `201`:

```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "user": {"id":1,"name":"Pratik Pawar","email":"pratik@example.com","created_at":"2026-09-27 10:00:00"},
    "token": "<JWT_TOKEN>"
  }
}
```

Invalid input or duplicate email: `400`.

## `POST /api/auth/login`

Authentication: none

Request body:

```json
{"email":"pratik@example.com","password":"StrongPass123"}
```

Success `200` returns the authenticated user and JWT token in `data.user` and `data.token`.

Invalid input: `400`.
Invalid credentials: `401`.

## `GET /api/auth/me`

Authentication: required

Success `200`:

```json
{"success":true,"data":{"user":{"id":1,"name":"Pratik Pawar","email":"pratik@example.com","created_at":"2026-09-27 10:00:00"}}}
```

Missing/invalid token: `401`.

## `POST /api/tasks`

Authentication: required

Request body:

```json
{"title":"Build authentication","description":"Add JWT authentication","status":"in_progress","due_date":"2026-10-05"}
```

`title` is required. `status` must be `pending`, `in_progress`, or `completed`. `due_date` must be `YYYY-MM-DD`.

Success `201` returns `data.task`.
Invalid body: `400`.
Missing/invalid token: `401`.

## `GET /api/tasks`

Authentication: required

Success `200`:

```json
{"success":true,"data":{"tasks":[],"count":0}}
```

Only the authenticated user's tasks are returned.

Missing/invalid token: `401`.

## `GET /api/tasks/:id`

Authentication: required

Success `200` returns `data.task`.
Invalid id: `400`.
Not found: `404`.
Task belongs to another user: `403`.
Missing/invalid token: `401`.

## `PUT /api/tasks/:id`

Authentication: required

Request body can contain one or more fields:

```json
{"title":"Finish API security","status":"completed"}
```

Success `200` returns the updated `data.task`.
Empty/invalid body: `400`.
Not found: `404`.
Task belongs to another user: `403`.
Missing/invalid token: `401`.

## `DELETE /api/tasks/:id`

Authentication: required

Success `200`:

```json
{"success":true,"message":"Task deleted successfully."}
```

Invalid id: `400`.
Not found: `404`.
Task belongs to another user: `403`.
Missing/invalid token: `401`.

## Validation error shape

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {"field":"title","message":"Title is required."}
  ]
}
```

## Testing with Postman

Import `postman/Task-Manager-API.postman_collection.json`.

Recommended sequence:

1. Register a user.
2. Login.
3. Copy the returned JWT into the collection variable `token`.
4. Create a task.
5. Get all tasks.
6. Get the task by ID.
7. Update it.
8. Delete it.
9. Run the protected-route-without-token test and confirm `401`.

## GitHub submission

Keep the repository public and make meaningful commits during development. Suggested commits:

```text
Initial Express API setup
Add SQLite database schema
Add registration and password hashing
Add JWT login authentication
Add protected task CRUD
Add validation and error handling
Add Postman collection
Add API documentation
Final testing fixes
```

Do not commit `.env`, `node_modules`, or the local SQLite database.
