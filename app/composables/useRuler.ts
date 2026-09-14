import type { LatLngLiteral, Map as LeafletMap, LeafletMouseEvent } from 'leaflet'

import L from 'leaflet'

import { Check, Plus, Trash2, Undo2 } from 'lucide'

type Line = LatLngLiteral[]

const STORAGE_KEY = 'azimuth-ruler'

const COLOR = '#1f9e89'

const active = ref(false)

let lines: Line[] = readStored()

let drawing = false

let map: LeafletMap | undefined

let layer: L.LayerGroup | undefined

let rubber: L.Polyline | undefined

let toolbar: L.Control | undefined

let crosshair: HTMLElement | undefined

// На таче пан завершается click'ом
let finePointer = false

function readStored(): Line[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')

    const isPoint = (point: unknown): point is LatLngLiteral =>
      typeof (point as LatLngLiteral)?.lat === 'number' && typeof (point as LatLngLiteral)?.lng === 'number'

    // L.polyline кидает на объекте без lat / lng
    return Array.isArray(raw)
      ? raw.filter((line) => Array.isArray(line) && line.length >= 2 && line.every(isPoint))
      : []
  } catch {
    return []
  }
}

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines.filter((line) => line.length >= 2)))
  } catch {
    // Safari private mode кидает на setItem
  }
}

function formatTime(distance: number): string {
  const seconds = distance / useSettings().speed.value

  return seconds < 60 ? `${Math.round(seconds)} с` : `${Math.round(seconds / 60)} мин`
}

function formatDistanceTime(distance: number): string {
  return `${Math.round(distance)} м · &asymp; ${formatTime(distance)}`
}

function segmentLabel(from: LatLngLiteral, to: LatLngLiteral): string {
  const { azimuth, distance } = inverseOffset(from.lat, from.lng, to.lat, to.lng)

  return `${azimuth}&deg; · ${formatDistanceTime(distance)}`
}

function totalLabel(distance: number): string {
  return `Итого: ${formatDistanceTime(distance)}`
}

function lineDistance(line: Line): number {
  let total = 0

  for (let i = 1; i < line.length; i++) {
    total += inverseOffset(line[i - 1]!.lat, line[i - 1]!.lng, line[i]!.lat, line[i]!.lng).distance
  }

  return total
}

function current(): Line | undefined {
  return drawing ? lines.at(-1) : undefined
}

function addPoint(latlng: LatLngLiteral): void {
  const line = current()

  if (line) {
    line.push(latlng)
  } else {
    lines.push([latlng])

    drawing = true
  }

  redraw()
}

function addPointAtCrosshair(): void {
  if (map) addPoint(map.getCenter())
}

function finishLine(): void {
  if (!drawing) {
    return
  }

  drawing = false

  if (lines.at(-1)!.length < 2) {
    lines.pop()
  }

  redraw()
}

function removePoint(line: Line, index: number): void {
  line.splice(index, 1)

  const isCurrent = line === current()

  // Завершённой линии нужно две точки, текущей — хотя бы одна
  if (line.length < (isCurrent ? 1 : 2)) {
    removeLine(line)

    return
  }

  redraw()
}

function removeLine(line: Line): void {
  if (line === current()) {
    drawing = false
  }

  lines.splice(lines.indexOf(line), 1)

  redraw()
}

function undo(): void {
  const line = lines.at(-1)

  if (line) removePoint(line, line.length - 1)
}

function clearAll(): void {
  // Нативный confirm: undo для этого нет
  // eslint-disable-next-line no-alert
  if (lines.length === 0 || !confirm('Удалить все линии?')) {
    return
  }

  lines = []

  drawing = false

  redraw()
}

function nodeIcon(editing: boolean): L.DivIcon {
  const size = editing ? 18 : 12

  return L.divIcon({ className: 'ruler-node', iconSize: [size, size] })
}

function labelContent(line: Line, index: number, deletable: boolean): string {
  let content = segmentLabel(line[index - 1]!, line[index]!)

  // При одном сегменте итог повторяет его подпись
  if (index === line.length - 1 && line.length > 2) {
    content += ` · ${totalLabel(lineDistance(line))}`
  }

  if (deletable) {
    content += ' <span class="ruler-label__delete" title="Удалить линию">✕</span>'
  }

  return content
}

function drawLine(line: Line, group: L.LayerGroup, editing: boolean): void {
  const isCurrent = line === current()

  const polyline = L.polyline(line, { color: COLOR, weight: 3, dashArray: '8 8', interactive: false }).addTo(group)

  // Индекс — конец сегмента
  const labels: L.Tooltip[] = []

  line.forEach((point, index) => {
    if (index === 0) return

    const deletable = editing && index === line.length - 1 && !isCurrent

    const tooltip = L.tooltip({
      permanent: true,
      direction: 'center',
      className: 'ruler-label',
      interactive: deletable,
    })
      .setLatLng(midpoint(line[index - 1]!, point))
      .setContent(labelContent(line, index, deletable))
      .addTo(group)

    labels[index] = tooltip

    // Нативный listener: tooltip.on не остановит click до карты
    if (deletable) {
      L.DomEvent.on(tooltip.getElement()!, 'click', (event) => {
        L.DomEvent.stop(event)

        if ((event.target as HTMLElement).classList.contains('ruler-label__delete')) {
          removeLine(line)
        }
      })
    }
  })

  // Не redraw: пересоздание маркера обрывает drag
  const refresh = () => {
    polyline.setLatLngs(line)

    labels.forEach((label, index) => {
      label
        .setLatLng(midpoint(line[index - 1]!, line[index]!))
        .setContent(labelContent(line, index, editing && index === line.length - 1 && !isCurrent))
    })
  }

  line.forEach((point, index) => {
    const marker = L.marker(point, {
      icon: nodeIcon(editing),
      pane: 'markers',
      interactive: editing,
      draggable: editing,
      bubblingMouseEvents: false,
    }).addTo(group)

    if (!editing) return

    marker
      .bindTooltip('Тянуть — переместить · клик — удалить')
      .on('click', () => removePoint(line, index))
      .on('drag', () => {
        line[index] = marker.getLatLng()

        refresh()
      })
      .on('dragend', redraw)
  })
}

function midpoint(a: LatLngLiteral, b: LatLngLiteral): LatLngLiteral {
  return { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 }
}

function redraw(): void {
  save()

  if (!layer) {
    return
  }

  layer.clearLayers()

  lines.forEach((line) => drawLine(line, layer!, active.value))

  if (!current()) {
    clearRubber()
  } else if (map && !finePointer) {
    updateRubber(map.getCenter())
  }
}

function updateRubber(cursor: LatLngLiteral): void {
  const line = current()

  if (!map || !line) {
    clearRubber()

    return
  }

  const last = line.at(-1)!

  if (!rubber) {
    rubber = L.polyline([], { color: COLOR, weight: 2, dashArray: '8 8', interactive: false })
      .bindTooltip('', { sticky: true })
      .addTo(map)
  }

  rubber.setLatLngs([last, cursor])

  const total = lineDistance(line) + inverseOffset(last.lat, last.lng, cursor.lat, cursor.lng).distance

  rubber.setTooltipContent(`${segmentLabel(last, cursor)} · ${totalLabel(total)}`).openTooltip(cursor)
}

function clearRubber(): void {
  rubber?.remove()

  rubber = undefined
}

function onClick(event: LeafletMouseEvent): void {
  addPoint(event.latlng)
}

function onMouseMove(event: LeafletMouseEvent): void {
  updateRubber(event.latlng)
}

function onMove(): void {
  if (map) updateRubber(map.getCenter())
}

function onDoubleClick(): void {
  // dblclick приходит после двух click в той же точке, но не на всех устройствах
  const line = current()

  const last = line?.at(-1)

  const prev = line?.at(-2)

  if (line && last && prev && last.lat === prev.lat && last.lng === prev.lng) {
    line.pop()
  }

  finishLine()
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    deactivate()
  }
}

function activate(): void {
  if (!map || active.value) {
    return
  }

  active.value = true

  finePointer = !matchMedia('(pointer: coarse)').matches

  crosshair!.hidden = false

  toolbar!.addTo(map)

  if (finePointer) {
    map.getContainer().style.cursor = 'crosshair'

    map.doubleClickZoom.disable()

    map.on('click', onClick)

    map.on('mousemove', onMouseMove)

    map.on('dblclick', onDoubleClick)
  } else {
    map.on('move', onMove)
  }

  document.addEventListener('keydown', onKeyDown)

  redraw()
}

function deactivate(): void {
  if (!map || !active.value) {
    return
  }

  active.value = false

  crosshair!.hidden = true

  toolbar!.remove()

  map.off('click', onClick)

  map.off('mousemove', onMouseMove)

  map.off('dblclick', onDoubleClick)

  map.off('move', onMove)

  map.doubleClickZoom.enable()

  map.getContainer().style.cursor = ''

  document.removeEventListener('keydown', onKeyDown)

  // finishLine без открытой линии не перерисовывает
  if (drawing) {
    finishLine()
  } else {
    redraw()
  }
}

export function useRuler() {
  function init(leafletMap: LeafletMap) {
    map = leafletMap

    layer = L.layerGroup().addTo(leafletMap)

    crosshair = L.DomUtil.create('div', 'ruler-crosshair', leafletMap.getContainer())

    crosshair.hidden = true

    toolbar = createToolbarControl({
      position: 'bottomright',
      buttons: [
        { icon: Plus, title: 'Точка в перекрестии', onClick: addPointAtCrosshair },
        { icon: Check, title: 'Завершить линию', onClick: finishLine },
        { icon: Undo2, title: 'Убрать последнюю точку', onClick: undo },
        { icon: Trash2, title: 'Удалить все линии', onClick: clearAll },
      ],
    })

    // Подписи считают время от скорости
    watch(useSettings().speed, redraw)

    redraw()
  }

  function toggle() {
    if (active.value) {
      deactivate()
    } else {
      activate()
    }
  }

  return { init, active: readonly(active), toggle }
}
