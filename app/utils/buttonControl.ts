import type { IconNode } from 'lucide'

import type { MaybeRefOrGetter, Ref } from 'vue'

import L from 'leaflet'

import { createElement } from 'lucide'

export function renderIcon(icon: IconNode): SVGElement {
  return createElement(icon, { width: 18, height: 18 })
}

interface CreateButtonControlOptions {
  icon: MaybeRefOrGetter<IconNode>
  title: MaybeRefOrGetter<string>
  onClick: () => void
  active?: Readonly<Ref<boolean>>
  position?: L.ControlPosition
}

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
        button.replaceChildren(renderIcon(toValue(icon)))

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

interface ToolbarButton {
  icon: IconNode
  title: string
  onClick: () => void
}

interface CreateToolbarControlOptions {
  buttons: ToolbarButton[]
  position?: L.ControlPosition
}

export function createToolbarControl({ buttons, position = 'bottomright' }: CreateToolbarControlOptions): L.Control {
  const ToolbarControl = L.Control.extend({
    options: { position },

    onAdd() {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control map-button map-toolbar')

      buttons.forEach(({ icon, title, onClick }) => {
        const button = L.DomUtil.create('a', 'map-button__button', container)

        button.href = '#'

        button.title = title

        button.replaceChildren(renderIcon(icon))

        button.setAttribute('role', 'button')

        L.DomEvent.on(button, 'click', (event) => {
          L.DomEvent.preventDefault(event)

          onClick()
        })
      })

      L.DomEvent.disableClickPropagation(container)

      L.DomEvent.disableScrollPropagation(container)

      return container
    },
  })

  return new ToolbarControl()
}
