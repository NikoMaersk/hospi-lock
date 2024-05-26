#!/bin/bash

redis-cli -h redis -p 6379 <<EOF
SELECT 1

HSET admin:admin@admin.com email "admin@admin.com" password "admin"

echo "Seeding complete."