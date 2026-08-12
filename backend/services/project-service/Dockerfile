FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
ARG JAR_FILE=target/project-service-0.1.0-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar
EXPOSE 8084
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
