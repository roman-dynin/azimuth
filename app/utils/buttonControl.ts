import type { MaybeRefOrGetter, Ref } from 'vue'

import L from 'leaflet'

interface CreateButtonControlOptions {
  icon: MaybeRefOrGetter<string>
  title: MaybeRefOrGetter<string>
  onClick: () => void
  active?: Readonly<Ref<boolean>>
  position?: L.ControlPosition
}

// Однокнопочный контрол карты (линейка, тема, настройки). Слой глубин — отдельно, у него легенда.
export function createButtonControl({
  icon,
  title,
  onClick,
  active,
  position = 'bottomleft',
}: CreateButtonControlOptions): L.Control {
  const ButtonControl = L.Control.extend({
    options: { position },

    onAdd() {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control map-button')

      const button = L.DomUtil.create('a', 'map-button__button', container)

      button.href = '#'

      button.setAttribute('role', 'button')

      watchEffect(() => {
        button.textContent = toValue(icon)

        button.title = toValue(title)

        container.classList.toggle('map-button--active', active?.value ?? false)
      })

      L.DomEvent.disableClickPropagation(container)

      L.DomEvent.disableScrollPropagation(container)

      L.DomEvent.on(button, 'click', (event) => {
        L.DomEvent.preventDefault(event)

        onClick()
      })

      return container
    },
  })

  return new ButtonControl()
}
