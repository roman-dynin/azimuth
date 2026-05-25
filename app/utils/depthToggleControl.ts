import L from 'leaflet'

interface CreateDepthToggleControlOptions {
  initialVisible: boolean
  onToggle: (visible: boolean) => void
}

export function createDepthToggleControl({ initialVisible, onToggle }: CreateDepthToggleControlOptions): L.Control {
  const DepthToggleControl = L.Control.extend({
    options: { position: 'bottomleft' as const },

    onAdd() {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control depth-toggle')

      const button = L.DomUtil.create('a', 'depth-toggle__button', container)

      button.href = '#'

      button.title = 'Слой глубин'

      button.setAttribute('role', 'button')

      button.textContent = '💧'

      const legend = L.DomUtil.create('div', 'depth-toggle__legend', container)

      L.DomUtil.create('div', 'depth-toggle__legend-bar', legend)

      const labels = L.DomUtil.create('div', 'depth-toggle__legend-labels', legend)

      const minLabel = L.DomUtil.create('span', '', labels)

      minLabel.textContent = `${MIN_DEPTH} м`

      const maxLabel = L.DomUtil.create('span', '', labels)

      maxLabel.textContent = `${MAX_DEPTH} м`

      let visible = initialVisible

      const syncActiveClass = () => {
        container.classList.toggle('depth-toggle--active', visible)
      }

      syncActiveClass()

      L.DomEvent.disableClickPropagation(container)

      L.DomEvent.disableScrollPropagation(container)

      L.DomEvent.on(button, 'click', (event) => {
        L.DomEvent.preventDefault(event)

        visible = !visible

        syncActiveClass()

        onToggle(visible)
      })

      return container
    },
  })

  return new DepthToggleControl()
}
