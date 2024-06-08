#!/bin/bash

redis-cli -h redis -p 6379 <<EOF
SELECT 1
HSET admin:admin@admin.com email "admin@admin.com" password "admin" iconUrl "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"
EOF

echo "Seeding complete."
