import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from './generated/client'

import 'dotenv/config'

// eslint-disable-next-line node/prefer-global/process
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })

const prisma = new PrismaClient({ adapter })

async function main() {
  const route = await prisma.route.create({
    data: {
      title: 'Тест',
    },
  })

  await prisma.waypoint.create({
    data: {
      routeId: route.id,
      azimuth: 90,
      seconds: 300,
    },
  })

  await prisma.waypoint.create({
    data: {
      routeId: route.id,
      azimuth: 150,
      seconds: 300,
    },
  })

  await prisma.waypoint.create({
    data: {
      routeId: route.id,
      azimuth: 240,
      seconds: 300,
    },
  })

  await prisma.waypoint.create({
    data: {
      routeId: route.id,
      azimuth: 330,
      seconds: 300,
    },
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)

    await prisma.$disconnect()

    // eslint-disable-next-line node/prefer-global/process
    process.exit(1)
  })
