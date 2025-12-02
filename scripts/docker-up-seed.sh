#!/usr/bin/env bash
set -euo pipefail

# Bring up MongoDB via docker-compose and run the seed script.
# Usage: ./scripts/docker-up-seed.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Starting MongoDB container (docker-compose)..."
docker-compose up -d mongo

echo "Waiting for MongoDB to accept connections..."
# Simple wait loop: try to run the seed; retry a few times if it fails.
RETRIES=12
SLEEP_SECONDS=2
COUNT=0
until npm run seed; do
  COUNT=$((COUNT+1))
  if [ "$COUNT" -ge "$RETRIES" ]; then
    echo "Seeding failed after $RETRIES attempts. Check docker logs and connectivity." >&2
    exit 1
  fi
  echo "Seed failed; retrying in $SLEEP_SECONDS seconds... (attempt $COUNT/$RETRIES)"
  sleep "$SLEEP_SECONDS"
done

echo "Seeding completed successfully. You can now run:\n  npm run start:server\n  npm start (in another terminal for frontend)"
