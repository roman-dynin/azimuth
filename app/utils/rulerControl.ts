import type { Ref } from 'vue'

import L from 'leaflet'

interface CreateRulerControlOptions {
  active: Readonly<Ref<boolean>>
  onToggle: () => void
}

export function createRulerControl({ active, onToggle }: CreateRulerControlOptions): L.Control {
  const RulerControl = L.Control.extend({
    options: { position: 'bottomleft' as const },

    onAdd() {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control ruler-toggle')

      const button = L.DomUtil.create('a', 'ruler-toggle__button', container)

      button.href = '#'

      button.title = 'Линейка'

      button.setAttribute('role', 'button')

      button.textContent = '📏'

      const syncActiveClass = () => {
        container.classList.toggle('ruler-toggle--active', active.value)
      }

      syncActiveClass()

      watch(active, syncActiveClass)

      L.DomEvent.disableClickPropagation(container)

      L.DomEvent.disableScrollPropagation(container)

      L.DomEvent.on(button, 'click', (event) => {
        L.DomEvent.preventDefault(event)

        onToggle()
      })

      return container
    },
  })

  return new RulerControl()
}
