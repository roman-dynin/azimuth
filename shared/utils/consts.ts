import type { LatLngTuple } from 'leaflet'

export const METERS_PER_DEGREE = 111320

// Магнитное склонение для DEFAULT_MAP_CENTER, восточное — положительное.
// Азимуты в БД — магнитные (с компаса), карта работает в истинных: истинный = магнитный + склонение.
// Значение по WMM-2025 на 2026-09 (NOAA), дрейф ≈ +0.09°/год — обновлять раз в пару лет:
// https://www.ngdc.noaa.gov/geomag/calculators/magcalc.shtml
export const MAGNETIC_DECLINATION_DEG = 10.3

// Скорость дайвера в м/с (это тестовое значение и пока имеет мало общего с реальной скоростью)
export const DIVER_SPEED_MULTIPLIER = 0.25

export const DEFAULT_MAP_CENTER: LatLngTuple = [53.241324, 34.478332]

export const DEFAULT_MAP_ZOOM = 19

export const WAYPOINT_EMOJI_OFFSET_METERS = 2

export const WAYPOINT_EMOJI_ANGLE_DEG = 45

export const WAYPOINT_EMOJI_SIZE_PX = 32
