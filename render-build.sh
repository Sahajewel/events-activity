set -o errexit

# 1. Install dependencies, which automatically runs 'postinstall'
#    The 'postinstall' script handles 'prisma generate'
npm install

# 2. Compile TypeScript into JavaScript
npm run build

# 3. Apply all pending database migrations in a production-safe way
npx prisma migrate deploy