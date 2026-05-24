import type { LatLngTuple } from 'leaflet'

export const METERS_PER_DEGREE = 111320

// Скорость дайвера в м/с (это тестовое значение и пока имеет мало общего с реальной скоростью)
export const DIVER_SPEED_MULTIPLIER = 0.25

export const DEFAULT_MAP_CENTER: LatLngTuple = [53.240901, 34.476359]

export const DEFAULT_MAP_ZOOM = 19

export const WAYPOINT_EMOJI_OFFSET_METERS = 2

export const WAYPOINT_EMOJI_ANGLE_DEG = 45

export const WAYPOINT_EMOJI_SIZE_PX = 32
