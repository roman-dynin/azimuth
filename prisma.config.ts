import { defineConfig } from 'prisma/config'

import 'dotenv/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // eslint-disable-next-line node/prefer-global/process
    url: process.env.DATABASE_URL,
  },
})
