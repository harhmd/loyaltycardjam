#!/bin/bash
set -e

echo "=== CREATING DATABASES IN POSTGRES18 ==="
docker exec postgres18-xqromzklsqsmfiaqiz6hbe3d psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'jamcard_db'" | grep -q 1 || \
    docker exec postgres18-xqromzklsqsmfiaqiz6hbe3d psql -U postgres -c "CREATE DATABASE jamcard_db;"

docker exec postgres18-xqromzklsqsmfiaqiz6hbe3d psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'loyaltycardjam_db'" | grep -q 1 || \
    docker exec postgres18-xqromzklsqsmfiaqiz6hbe3d psql -U postgres -c "CREATE DATABASE loyaltycardjam_db;"

echo "=== RUNNING SCHEMA & SEED ON jamcard_db ==="
docker cp /root/init_jamcard_db.sql postgres18-xqromzklsqsmfiaqiz6hbe3d:/tmp/init_jamcard_db.sql
docker exec postgres18-xqromzklsqsmfiaqiz6hbe3d psql -U postgres -d jamcard_db -f /tmp/init_jamcard_db.sql

echo "=== RUNNING SCHEMA & SEED ON loyaltycardjam_db ==="
docker exec postgres18-xqromzklsqsmfiaqiz6hbe3d psql -U postgres -d loyaltycardjam_db -f /tmp/init_jamcard_db.sql

echo "=== VERIFYING TABLES IN jamcard_db ==="
docker exec postgres18-xqromzklsqsmfiaqiz6hbe3d psql -U postgres -d jamcard_db -c "\dt"

echo "=== ALL DONE ==="
