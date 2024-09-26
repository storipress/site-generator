import type { Directive } from 'vue'

function fadeInHandler(e: Event) {
  if (!(e.target instanceof HTMLImageElement)) return false

  const el = e.target
  fadeIn(el)
}
function fadeIn(el: HTMLImageElement) {
  el.style.removeProperty('opacity')

  setTimeout(() => {
    el.style.removeProperty('will-change')
    el.style.removeProperty('transition-duration')
    el.classList.remove('transition-opacity')
  }, 500)
}

export const imageFadeIn: Directive = {
  getSSRProps: () => {
    return {
      class: 'transition-opacity',
      style: {
        willChange: 'opacity',
        opacity: '0',
        transitionDuration: '0.3s',
      },
    }
  },
  beforeMount: (el) => {
    if (!(el instanceof HTMLImageElement)) {
      return
    }

    if (el.naturalHeight || el.naturalWidth) {
      fadeIn(el)
      return
    }

    el.style.willChange = 'opacity'
    el.style.opacity = '0'
    el.style.transitionDuration = '0.3s'
    el.classList.add('transition-opacity')

    el.addEventListener('load', fadeInHandler, { once: true })
  },
  mounted: (el) => {
    if (!(el instanceof HTMLImageElement)) {
      return
    }

    if (el.naturalHeight || el.naturalWidth) {
      fadeIn(el)
    }
  },
}
