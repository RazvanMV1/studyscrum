# ── Etapa 1: Build ──────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS builder


WORKDIR /app

COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B 2>/dev/null || true

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -DskipTests -B

# ── Etapa 2: Runtime ─────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

RUN addgroup -S studyscrum && adduser -S studyscrum -G studyscrum

COPY --from=builder /app/target/*.jar app.jar

RUN chown studyscrum:studyscrum app.jar

USER studyscrum

EXPOSE 8084

ENV EUREKA_URL=""
ENV MONGODB_URI=""

ENTRYPOINT ["java", "-jar", "app.jar"]
