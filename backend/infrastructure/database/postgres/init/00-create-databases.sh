#!/bin/bash
set -euo pipefail

databases=(
  devflow_auth
  devflow_user
  devflow_organization
  devflow_project
  devflow_task
  devflow_sprint
  devflow_document
  devflow_repository
  devflow_deployment
  devflow_notification
  devflow_analytics
  devflow_audit
)

# Connect to POSTGRES_DB (postgres). libpq defaults to a DB named after the user ("devflow"), which we do not create.
admin_db="${POSTGRES_DB:-postgres}"

for db in "${databases[@]}"; do
  exists="$(psql -U "${POSTGRES_USER}" -d "${admin_db}" -tAc "SELECT 1 FROM pg_database WHERE datname='${db}'")"
  if [[ "${exists}" != "1" ]]; then
    echo "Creating database ${db}"
    psql -U "${POSTGRES_USER}" -d "${admin_db}" -c "CREATE DATABASE ${db}"
  else
    echo "Database ${db} already exists"
  fi
done

psql -U "${POSTGRES_USER}" -d devflow_auth -c 'CREATE EXTENSION IF NOT EXISTS "pgcrypto";'
