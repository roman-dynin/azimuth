import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '~~/prisma/generated/client'

function prismaClientSingleton() {
  // eslint-disable-next-line node/prefer-global/process
  const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! })

  return new PrismaClient({ adapter: pool })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// eslint-disable-next-line node/prefer-global/process
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
