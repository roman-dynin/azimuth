// Во всём приложении azimuth — магнитный (показание компаса). Пересчёт в истинный
// и обратно живёт только здесь, чтобы buildRoutes и линейка не расходились.
export function forwardOffset(
  prevLat: number,
  prevLng: number,
  azimuth: number,
  distance: number,
): [number, number] {
  const radians = (azimuth + MAGNETIC_DECLINATION_DEG) * (Math.PI / 180)

  const latOffset = (distance * Math.cos(radians)) / METERS_PER_DEGREE

  const lngOffset = (distance * Math.sin(radians)) / (METERS_PER_DEGREE * Math.cos(prevLat * (Math.PI / 180)))

  return [prevLat + latOffset, prevLng + lngOffset]
}

export function inverseOffset(
  prevLat: number,
  prevLng: number,
  targetLat: number,
  targetLng: number,
): { azimuth: number; distance: number } {
  const latOffset = (targetLat - prevLat) * METERS_PER_DEGREE

  const lngOffset = (targetLng - prevLng) * METERS_PER_DEGREE * Math.cos(prevLat * (Math.PI / 180))

  const distance = Math.sqrt(latOffset ** 2 + lngOffset ** 2)

  const trueAzimuth = (Math.atan2(lngOffset, latOffset) * 180) / Math.PI

  const azimuth = Math.round((((trueAzimuth - MAGNETIC_DECLINATION_DEG) % 360) + 360) % 360) % 360

  return { azimuth, distance }
}
