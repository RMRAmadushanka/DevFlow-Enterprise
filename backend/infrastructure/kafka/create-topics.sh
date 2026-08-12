#!/bin/bash
set -euo pipefail

BOOTSTRAP="${KAFKA_BOOTSTRAP_SERVERS:-kafka:9092}"

topics=(
  user-events
  user-authentication-events
  organization-events
  team-events
  membership-events
  invitation-events
  project-events
  task-events
  notification-events
  audit-events
)

echo "Waiting for Kafka at ${BOOTSTRAP}..."
for i in $(seq 1 30); do
  if /opt/kafka/bin/kafka-topics.sh --bootstrap-server "${BOOTSTRAP}" --list >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

for topic in "${topics[@]}"; do
  echo "Ensuring topic ${topic}"
  /opt/kafka/bin/kafka-topics.sh \
    --bootstrap-server "${BOOTSTRAP}" \
    --create \
    --if-not-exists \
    --topic "${topic}" \
    --partitions 3 \
    --replication-factor 1
done

/opt/kafka/bin/kafka-topics.sh --bootstrap-server "${BOOTSTRAP}" --list
