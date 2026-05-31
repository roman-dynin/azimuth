import type { LatLngLiteral, Map as LeafletMap, LeafletMouseEvent } from 'leaflet'

import L from 'leaflet'

type Phase = 'drawing' | 'viewing'

const active = ref(false)

let map: LeafletMap | undefined

let rulerLayer: L.LayerGroup | undefined

let rubberLine: L.Polyline | undefined

let phase: Phase = 'drawing'

const points: LatLngLiteral[] = []

function formatMeters(distance: number): string {
  return `${Math.round(distance)} м`
}

function formatTime(distance: number): string {
  const seconds = distance / DIVER_SPEED_MULTIPLIER

  return seconds < 60 ? `${Math.round(seconds)} с` : `${Math.round(seconds / 60)} мин`
}

function formatDistanceTime(distance: number): string {
  return `${formatMeters(distance)} · &asymp; ${formatTime(distance)}`
}

function segmentLabel(from: LatLngLiteral, to: LatLngLiteral): string {
  const { azimuth, distance } = inverseOffset(from.lat, from.lng, to.lat, to.lng)

  return `${azimuth}&deg; · ${formatDistanceTime(distance)}`
}

function totalLabel(distance: number): string {
  return `Итого: ${formatDistanceTime(distance)}`
}

function totalDistance(): number {
  let total = 0

  for (let i = 1; i < points.length; i++) {
    total += inverseOffset(points[i - 1]!.lat, points[i - 1]!.lng, points[i]!.lat, points[i]!.lng).distance
  }

  return total
}

function redraw(): void {
  if (!rulerLayer) {
    return
  }

  const layer = rulerLayer

  layer.clearLayers()

  if (points.length > 0) {
    L.polyline(points, { color: '#1f9e89', weight: 3, dashArray: '8 8', interactive: false }).addTo(layer)
  }

  points.forEach((point, index) => {
    L.circleMarker(point, {
      radius: 6,
      color: '#1f9e89',
      fillColor: '#ffffff',
      fillOpacity: 1,
      weight: 2,
      pane: 'markers',
      interactive: false,
    }).addTo(layer)

    if (index === 0) {
      return
    }

    const prev = points[index - 1]!

    const midpoint: LatLngLiteral = { lat: (prev.lat + point.lat) / 2, lng: (prev.lng + point.lng) / 2 }

    let content = segmentLabel(prev, point)

    // Итог по всему маршруту показываем на последнем сегменте — но только когда сегментов
    // больше одного, иначе он дословно повторяет подпись самого сегмента.
    if (phase === 'viewing' && index === points.length - 1 && points.length > 2) {
      content += ` · ${totalLabel(totalDistance())}`
    }

    L.tooltip({ permanent: true, direction: 'center', className: 'ruler-label' })
      .setLatLng(midpoint)
      .setContent(content)
      .addTo(layer)
  })
}

function updateRubber(cursor: LatLngLiteral): void {
  if (!map || points.length === 0) {
    return
  }

  const last = points.at(-1)!

  if (rubberLine) {
    rubberLine.setLatLngs([last, cursor])
  } else {
    rubberLine = L.polyline([last, cursor], { color: '#1f9e89', weight: 2, dashArray: '8 8', interactive: false })
      .bindTooltip('', { sticky: true })
      .addTo(map)
  }

  const total = totalDistance() + inverseOffset(last.lat, last.lng, cursor.lat, cursor.lng).distance

  rubberLine.setTooltipContent(`${segmentLabel(last, cursor)} · ${totalLabel(total)}`).openTooltip(cursor)
}

function clearRubber(): void {
  rubberLine?.remove()

  rubberLine = undefined
}

function resetLine(): void {
  points.length = 0

  clearRubber()

  rulerLayer?.clearLayers()
}

// Прекращаем интерактив рисования: снимаем обработчики, возвращаем курсор и зум карты.
function stopDrawingInteraction(): void {
  if (!map) {
    return
  }

  map.off('click', onClick)

  map.off('mousemove', onMouseMove)

  map.off('dblclick', onDoubleClick)

  map.doubleClickZoom.enable()

  map.getContainer().style.cursor = ''
}

function onClick(event: LeafletMouseEvent): void {
  points.push(event.latlng)

  redraw()
}

function onMouseMove(event: LeafletMouseEvent): void {
  updateRubber(event.latlng)
}

function onDoubleClick(): void {
  if (phase !== 'drawing') {
    return
  }

  // Двойной клик Leaflet'а обычно идёт после пары click в той же точке — убираем дубль,
  // но только если он действительно есть (на части устройств лишнего click может не быть).
  const last = points.at(-1)

  const prev = points.at(-2)

  if (last && prev && last.lat === prev.lat && last.lng === prev.lng) {
    points.pop()
  }

  finish()
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    deactivate()
  }
}

// Прекратить рисование, но оставить нарисованную линию на карте для просмотра:
// убираем «резинку», возвращаем обычную навигацию по карте, гасим обработчики рисования.
function finish(): void {
  if (!map || phase !== 'drawing') {
    return
  }

  if (points.length < 2) {
    deactivate()

    return
  }

  stopDrawingInteraction()

  clearRubber()

  phase = 'viewing'

  redraw()
}

function deactivate(): void {
  if (!map || !active.value) {
    return
  }

  stopDrawingInteraction()

  document.removeEventListener('keydown', onKeyDown)

  resetLine()

  phase = 'drawing'

  active.value = false
}

function activate(): void {
  if (!map || active.value) {
    return
  }

  active.value = true

  phase = 'drawing'

  resetLine()

  map.getContainer().style.cursor = 'crosshair'

  map.doubleClickZoom.disable()

  map.on('click', onClick)

  map.on('mousemove', onMouseMove)

  map.on('dblclick', onDoubleClick)

  document.addEventListener('keydown', onKeyDown)
}

export function useRuler() {
  function init(leafletMap: LeafletMap) {
    map = leafletMap

    rulerLayer = L.layerGroup().addTo(leafletMap)
  }

  function toggle() {
    if (!active.value) {
      activate()
    } else if (phase === 'drawing') {
      finish()
    } else {
      deactivate()
    }
  }

  return { init, active: readonly(active), toggle, deactivate }
}
