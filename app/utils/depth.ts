export const MIN_DEPTH = 0

export const MAX_DEPTH = 14

export const DEPTH_HALO_RADIUS_METERS = 27

export const VIRIDIS_STOPS = [
  '#fde725',
  '#b5de2b',
  '#6ece58',
  '#35b779',
  '#1f9e89',
  '#26828e',
  '#31688e',
  '#3e4989',
  '#482878',
  '#440154',
]

export const DEPTH_HALO_RINGS: ReadonlyArray<{ scale: number; opacity: number }> = [
  { scale: 1.0, opacity: 0.1 },
  { scale: 0.7, opacity: 0.2 },
  { scale: 0.4, opacity: 0.35 },
]

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16)

  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]
}

function mixChannel(start: number, end: number, fraction: number): number {
  return Math.round(start + (end - start) * fraction)
}

export function getDepthColor(depth: number): string {
  const normalizedDepth = Math.max(0, Math.min(1, (depth - MIN_DEPTH) / (MAX_DEPTH - MIN_DEPTH)))

  const position = normalizedDepth * (VIRIDIS_STOPS.length - 1)

  const stopIndex = Math.min(Math.floor(position), VIRIDIS_STOPS.length - 2)

  const stopFraction = position - stopIndex

  const [startRed, startGreen, startBlue] = hexToRgb(VIRIDIS_STOPS[stopIndex]!)

  const [endRed, endGreen, endBlue] = hexToRgb(VIRIDIS_STOPS[stopIndex + 1]!)

  const red = mixChannel(startRed, endRed, stopFraction)

  const green = mixChannel(startGreen, endGreen, stopFraction)

  const blue = mixChannel(startBlue, endBlue, stopFraction)

  return `rgb(${red}, ${green}, ${blue})`
}
