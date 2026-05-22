# StudyScrum

A cloud-native project management platform built for academic Scrum teams.
Manage projects, sprints, and tickets with real-time collaboration.

---

## Tech Stack

### Backend
- **Java 21** (Eclipse Temurin) + **Spring Boot 3.5.0**
- **Spring Cloud 2025.0.2** (Eureka, Gateway)
- **Maven 3.9**
- **MongoDB 7.0** - primary database
- **Redis 7.2** - pub/sub messaging
- **Spring WebSocket + STOMP** - real-time notifications
- **Spring Security + JWT** (jjwt 0.12.6) + **Google OAuth2**
- **Spring Cloud Gateway** (WebFlux)
- **Spring Cloud Netflix Eureka** - service discovery

### Frontend
- **React 18** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4**
- **React Router v6**
- **Axios** - HTTP client with JWT interceptors
- **@stomp/stompjs** + **sockjs-client** - WebSocket client

### Infrastructure
- **Docker** + **Docker Compose v2** - local development
- **Kubernetes** - production orchestration (WIP)
- **GitHub Actions** - CI/CD (WIP)
- **Prometheus + Grafana** - observability (WIP)

---

## Microservices

| Service | Port | Description |
|---------|------|-------------|
| eureka-server | 8761 | Service discovery and registry |
| identity-service | 8081 | Google OAuth2 + JWT authentication |
| api-gateway | 8080 | Routing, JWT validation, CORS |
| project-service | 8082 | Project and member management |
| sprint-service | 8083 | Sprint lifecycle + burndown tracking |
| ticket-service | 8084 | Kanban tickets (User Story / Task / Bug) |
| notification-service | 8085 | WebSocket STOMP + Redis pub/sub |
| frontend | 5173 | React SPA (dev) / 80 (Docker/Nginx) |

---

## Prerequisites

- Java 21 (Eclipse Temurin) with JAVA_HOME set
- Maven 3.9+
- Node.js 24 + npm
- Docker Desktop with Docker Compose v2
- Git 2.x

---

## Quick Start with Docker

### 1. Clone the repository

```bash
git clone https://github.com/USERNAME/studyscrum.git
cd studyscrum
```

### 2. Create environment file

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret-min-256-bits
```

### 3. Build and start all services

```bash
docker compose up --build -d
```

### 4. Verify all services are running

```bash
docker compose ps
```

### 5. Open the app

- Frontend: http://localhost:5173
- Eureka Dashboard: http://localhost:8761
- API Gateway: http://localhost:8080

---

## Quick Start for Local Development

### 1. Start infrastructure only

```bash
docker compose up -d mongodb redis
```

### 2. Set environment variables (PowerShell)

```powershell
$env:GOOGLE_CLIENT_ID="your-google-client-id"
$env:GOOGLE_CLIENT_SECRET="your-google-client-secret"
$env:JWT_SECRET="your-jwt-secret-min-256-bits"
```

### 3. Start services in order

Each in a separate terminal:

```powershell
# Terminal 1
cd eureka-server; mvn spring-boot:run

# Terminal 2
cd identity-service; mvn spring-boot:run

# Terminal 3
cd api-gateway; mvn spring-boot:run

# Terminal 4
cd project-service; mvn spring-boot:run

# Terminal 5
cd sprint-service; mvn spring-boot:run

# Terminal 6
cd ticket-service; mvn spring-boot:run

# Terminal 7
cd notification-service; mvn spring-boot:run

# Terminal 8
cd frontend; npm install; npm run dev
```

---

## Google OAuth2 Setup

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth2 credentials (Web application)
5. Add authorized redirect URIs:
   - http://localhost:8081/login/oauth2/code/google
   - http://localhost:8080/login/oauth2/code/google
6. Add test users in OAuth consent screen
7. Copy Client ID and Client Secret to .env

---

## Authentication Flow

```
1. User clicks Continue with Google
2. Browser -> GET /login/oauth2/authorization/google
3. API Gateway forwards to Identity Service (hardcoded URL, not via Eureka)
4. Identity Service redirects to Google
5. Google authenticates and redirects back to:
   http://localhost:8081/login/oauth2/code/google
6. Identity Service creates/updates User in MongoDB
7. Identity Service generates:
   - JWT access token (24h)
   - JWT refresh token (7 days)
8. Redirect to frontend:
   http://localhost:5173/auth/callback?accessToken=...&refreshToken=...
9. Frontend stores tokens in localStorage
10. Frontend calls GET /auth/me to load user profile
```

---

## Real-time Notifications Flow

```
1. Frontend connects: ws://localhost:8085/ws?token=JWT
2. WebSocketAuthInterceptor validates JWT at handshake
3. Frontend subscribes to: /topic/project/{projectId}
4. Any service publishes to Redis: notifications:{projectId}
5. RedisMessageSubscriber receives message from Redis
6. Message forwarded via STOMP to all subscribed clients
```

---

## API Endpoints

### Identity Service

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /auth/me | JWT | Get current user profile |
| POST | /auth/refresh | - | Refresh access token |

### Project Service

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /projects | JWT | List user projects |
| POST | /projects | JWT | Create project |
| GET | /projects/{id} | JWT | Get project by ID |
| POST | /projects/{id}/members | JWT | Add member to project |

### Sprint Service

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /sprints/{projectId} | JWT | List sprints |
| POST | /sprints/{projectId} | JWT | Create sprint |
| GET | /sprints/{projectId}/{sprintId} | JWT | Get sprint |
| PATCH | /sprints/{projectId}/{sprintId}/activate | JWT | Activate sprint |
| PATCH | /sprints/{projectId}/{sprintId}/complete | JWT | Complete sprint |
| PATCH | /sprints/{projectId}/{sprintId}/progress | JWT | Update progress |
| POST | /sprints/{projectId}/{sprintId}/snapshot | JWT | Add burndown snapshot |
| GET | /sprints/{projectId}/velocity | JWT | Get velocity |

### Ticket Service

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /tickets/{projectId} | JWT | List project tickets |
| POST | /tickets/{projectId} | JWT | Create ticket |
| GET | /tickets/{projectId}/sprint/{sprintId} | JWT | List sprint tickets |
| GET | /tickets/{projectId}/{ticketId} | JWT | Get ticket |
| PATCH | /tickets/{projectId}/{ticketId} | JWT | Update ticket |
| PATCH | /tickets/{projectId}/{ticketId}/move | JWT | Move ticket in Kanban |
| PATCH | /tickets/{projectId}/{ticketId}/assign-sprint | JWT | Assign to sprint |
| PATCH | /tickets/{projectId}/{ticketId}/remove-sprint | JWT | Remove from sprint |
| DELETE | /tickets/{projectId}/{ticketId} | JWT | Delete ticket |

### Notification Service

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /notifications/publish | JWT | Publish notification |
| WS | ws://localhost:8085/ws?token=JWT | JWT | WebSocket connection |

---

## Project Structure

```
studyscrum/
├── eureka-server/          # Spring Cloud Eureka Server
├── identity-service/       # Authentication + JWT + Google OAuth2
├── api-gateway/            # Spring Cloud Gateway + JWT filter
├── project-service/        # Project + member management
├── sprint-service/         # Sprint lifecycle + burndown
├── ticket-service/         # Kanban tickets
├── notification-service/   # WebSocket STOMP + Redis pub/sub
├── frontend/               # React 18 + TypeScript + Vite
├── k8s/                    # Kubernetes manifests (WIP)
├── .github/                # GitHub Actions workflows (WIP)
├── docker-compose.yml      # Full local stack
├── .env.example            # Environment variables template
└── README.md
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| GOOGLE_CLIENT_ID | Yes | Google OAuth2 Client ID |
| GOOGLE_CLIENT_SECRET | Yes | Google OAuth2 Client Secret |
| JWT_SECRET | Yes | JWT signing secret (min 256 bits) |

---

## Known Constraints

- Google OAuth2 redirect URIs are hardcoded to localhost - update for production
- WebSocket connection is direct to port 8085 - not proxied through Gateway (WebFlux limitation)
- OAuth2 routes /login/** and /oauth2/** are hardcoded in Gateway - not via Eureka
- MongoDB runs as single node locally - ReplicaSet required for production transactions
- JWT secret must be the same across all services that validate tokens

---

## Completed Phases

- Phase 0 - Project setup and monorepo structure
- Phase 1 - Identity Service skeleton
- Phase 2 - Google OAuth2 + JWT
- Phase 3 - Eureka Server
- Phase 4 - API Gateway
- Phase 5 - Project Service
- Phase 6 - Sprint Service (burndown + velocity)
- Phase 7 - Ticket Service (Kanban board)
- Phase 8 - Notification Service (WebSocket STOMP + Redis pub/sub)
- Phase 9 - Frontend React (auth flow, dashboard, Kanban board)
- Phase 10 - Docker multi-stage builds + Compose stack

## Remaining Phases

- Phase 11 - Kubernetes local with kind
- Phase 12 - MongoDB ReplicaSet on Kubernetes
- Phase 13 - Cluster provisioning on RaaS-IS (OpenStack)
- Phase 14 - Production deploy on RaaS-IS
- Phase 15 - CI/CD with GitHub Actions
- Phase 16 - SonarQube
- Phase 17 - Observability with Prometheus + Grafana
- Phase 18 - Final polish, OpenAPI on SwaggerHub, demo

---

## Built With

StudyScrum is a university cloud computing project demonstrating microservices
architecture, containerization, and real-time collaboration.
