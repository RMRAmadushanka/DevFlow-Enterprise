#!/bin/bash
set -euo pipefail

BOOTSTRAP="${KAFKA_BOOTSTRAP_SERVERS:-kafka:29092}"
TOPICS=(user-events user-authentication-events organization-events team-events membership-events invitation-events project-events task-events notification-events audit-events)

echo "Waiting for Kafka at ${BOOTSTRAP}..."
for i in $(seq 1 40); do
  if kafka-topics.sh --bootstrap-server "${BOOTSTRAP}" --list >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

for topic in "${TOPICS[@]}"; do
  echo "Ensuring topic ${topic}"
  kafka-topics.sh \
    --bootstrap-server "${BOOTSTRAP}" \
    --create \
    --if-not-exists \
    --topic "${topic}" \
    --partitions 3 \
    --replication-factor 1 || true
done

echo "Current topics:"
kafka-topics.sh --bootstrap-server "${BOOTSTRAP}" --list
