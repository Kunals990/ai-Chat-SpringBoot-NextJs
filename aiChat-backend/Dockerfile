# Use OpenJDK 23 as base image
FROM openjdk:23-slim

# Copy the built jar into the container
COPY target/aiChat-backend-0.0.1-SNAPSHOT.jar app.jar
# Expose the port your Spring Boot app runs on
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]