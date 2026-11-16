# NexusDesk — Full-Stack Workspace Management Platform

NexusDesk is a learning/portfolio monorepo with two separate frontends:
- **React user desktop** for personal workspaces, notes, files and settings.
- **Angular + TypeScript admin dashboard** for managing users and platform usage.
- **Node.js + Express REST API** with JWT authentication and MongoDB persistence.

## Technology mapping

| Technology | Where it is used |
|---|---|
| HTML | React and Angular templates / JSX output |
| CSS | Responsive user and admin interfaces |
| JavaScript | React, Express and server logic |
| MongoDB | Users, workspace items, file metadata and settings |
| React | Main user-facing desktop |
| Node.js | API runtime |
| Express.js | REST endpoints and middleware |
| Angular | Separate admin dashboard |
| TypeScript | Angular admin application |
| MERN | React + Express + Node.js + MongoDB |

## Prerequisites
- Node.js 20+
- npm
- MongoDB local instance or MongoDB Atlas connection string

## Setup

1. Create a MongoDB database (local MongoDB or Atlas).
2. In `server/`, copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
3. From the project root, install dependencies:

```bash
npm run install:all
```

4. Start the API:

```bash
npm run dev:server
```

5. In a second terminal, start the React user interface:

```bash
npm run dev:client
```

6. In a third terminal, start the Angular admin dashboard:

```bash
npm run dev:admin
```

- React: http://localhost:5173
- API: http://localhost:5000
- Angular admin: http://localhost:4200

## First admin account
Register normally through the React app. To grant admin access for local development, update that user's `role` field to `admin` in MongoDB. Admin API routes and the Angular dashboard require an admin JWT.

## Main API routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current account |
| GET/POST | `/api/workspace` | List/create workspace items |
| PUT/DELETE | `/api/workspace/:id` | Update/delete workspace item |
| GET/POST | `/api/files` | List/upload file metadata |
| GET/PUT | `/api/settings` | Read/update preferences |
| GET | `/api/admin/overview` | Admin metrics |
| GET | `/api/admin/users` | List users |
| PATCH | `/api/admin/users/:id/role` | Change user role |
| DELETE | `/api/admin/users/:id` | Delete user |

## Notes
- Uploaded files are stored in `server/uploads/`; MongoDB stores metadata and ownership.
- The sample is a portfolio starter, not a production-hardened service. Before public deployment, add rate limiting, email verification, password reset, audit logs, malware scanning, cloud object storage, stricter validation, backups and security review.
- Do not commit `.env` or real secrets.
