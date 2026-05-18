# StudyScrum

O platformă de management Scrum pentru echipele de studenți care lucrează la proiecte academice.

## Stack tehnologic

- **Backend:** Java 21 + Spring Boot 3.x, arhitectură microservicii, Maven multi-module
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Bază de date:** MongoDB ReplicaSet (3 noduri)
- **Cache & Pub/Sub:** Redis
- **Real-time:** Spring WebSocket + STOMP
- **Autentificare:** Spring Security + JWT + Google OAuth2
- **API Gateway:** Spring Cloud Gateway
- **Service Discovery:** Spring Cloud Netflix Eureka
- **Containerizare:** Docker (multi-stage builds)
- **Orchestrare:** Kubernetes pe RaaS-IS (OpenStack)
- **CI/CD:** GitHub Actions
- **Observabilitate:** Prometheus + Grafana + Micrometer

## Microservicii

| Serviciu | Port | Descriere |
|---|---|---|
| eureka-server | 8761 | Service registry |
| api-gateway | 8080 | API Gateway, validare JWT |
| identity-service | 8081 | Autentificare, JWT, OAuth2 |
| project-service | 8082 | Proiecte, membri, roluri |
| sprint-service | 8083 | Sprinturi, burndown, velocity |
| ticket-service | 8084 | User stories, taskuri, bug-uri |
| notification-service | 8085 | Notificări, WebSocket, email |

## Deployment

Deployat pe **RaaS-IS** — cloud-ul privat OpenStack al Facultății de Informatică, UAIC Iași.
