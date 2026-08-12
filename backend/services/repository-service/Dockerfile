FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
ARG JAR_FILE=target/repository-service-0.1.0-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar
EXPOSE 8088
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
