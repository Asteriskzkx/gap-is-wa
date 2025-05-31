#!/bin/sh

set -e

echo "🔄 Starting database migration..."

# รอให้ database พร้อม
echo "⏳ Waiting for database to be ready..."
until npx prisma migrate deploy 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Generate Prisma Client (เผื่อไว้)
echo "🔨 Generating Prisma Client..."
npx prisma generate

# Seed database (ถ้ามี)
if [ -f "prisma/seeds/index.ts" ] || [ -f "prisma/seeds/index.js" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed
fi

echo "✅ Migration completed successfully!"