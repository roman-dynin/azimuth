import type { LatLngTuple } from 'leaflet'

export default defineEventHandler(async () => {
  const rawWaypoints = await prisma.waypoint.findMany({
    orderBy: {
      id: 'asc',
    },
  })

  const METERS_PER_DEGREE = 111320

  const speedMultiplier = 0.25 // м/с (тестовое значение не имеющее ничего общего с реальной скоростью)

  let currentLat = 53.2409518

  let currentLng = 34.4762879

  return rawWaypoints.map((waypoint) => {
    const distance = waypoint.seconds * speedMultiplier

    const radians = waypoint.azimuth * (Math.PI / 180)

    const latOffset = distance * Math.cos(radians) / METERS_PER_DEGREE

    const lngOffset = distance * Math.sin(radians) / (METERS_PER_DEGREE * Math.cos(currentLat * (Math.PI / 180)))

    currentLat += latOffset

    currentLng += lngOffset

    return {
      ...waypoint,
      lat_lng: [currentLat, currentLng] as LatLngTuple,
    }
  })
})
