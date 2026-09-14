import type { LatLngTuple } from 'leaflet'

export const METERS_PER_DEGREE = 111320

// WMM-2025 для DEFAULT_MAP_CENTER, восток положительный, дрейф ≈ +0.09°/год: https://www.ngdc.noaa.gov/geomag/calculators/magcalc.shtml
export const MAGNETIC_DECLINATION_DEG = 10.3

// м/с, взято с потолка
export const DIVER_SPEED_MULTIPLIER = 0.25

export const DEFAULT_MAP_CENTER: LatLngTuple = [53.241324, 34.478332]

export const DEFAULT_MAP_ZOOM = 19

export const WAYPOINT_EMOJI_OFFSET_METERS = 2

export const WAYPOINT_EMOJI_ANGLE_DEG = 45

export const WAYPOINT_EMOJI_SIZE_PX = 32
