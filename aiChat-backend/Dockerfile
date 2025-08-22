# =========================
# 1) Build stage (Maven)
# =========================
FROM maven:3.9-eclipse-temurin-21 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies first (caches layers)
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

# Copy source code
COPY src ./src

# Build the JAR (skipping tests for speed; remove -DskipTests if you want tests)
RUN mvn -q -B -DskipTests package

# =========================
# 2) Runtime stage (JRE only)
# =========================
FROM eclipse-temurin:21-jre

# Set working directory
WORKDIR /app

# Copy the built jar into the runtime image
COPY --from=build /app/target/aiChat-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose Spring Boot port
EXPOSE 8080

# Run the JAR
ENTRYPOINT ["java", "-jar", "app.jar"]
