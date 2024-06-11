#!/bin/bash

redis-cli -h redis -p 6379 -n 1 <<EOF
HSET admin:admin@mail.com email "admin@admin.com" password '$2a$10$DDy2MxJeG2KV3VSatJ/bKORQd49WRZTiiFPriyKldLGqhwOzRvuZi' iconUrl "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff&length=1"
EOF

echo "Seeding complete."
