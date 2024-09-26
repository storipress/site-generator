<script lang="ts">
/*
 * INFO: image url query specification:
 * - Bunny CDN: https://support.bunny.net/hc/en-us/articles/360027448392-Bunny-Optimizer-Engine-Documentation
 * - Unsplash: https://unsplash.com/documentation#supported-parameters
 */

import { defu } from 'defu'
import { imageFadeIn } from '../directives/image-fade-in'
import { IMAGE_CONTROL } from './image'

const DEFAULT_WIDTH = ['180', '375', '750', '1200', '1600', '1920']

const SP_CDN_REGEX = /^https:\/\/assets\.stori\.press\/.*/i
const UNSPLASH_REGEX = /^https:\/\/images\.unsplash\.com\/.*/i
const DATA_URI_REGEX = /^data:[\w+/-]*(?:;charset=[\w-]+|;base64)?,.*/gi

function isStoripressCDN(url: string) {
  return SP_CDN_REGEX.test(url)
}
function isUnsplash(url: string) {
  return UNSPLASH_REGEX.test(url)
}
function isDataUri(url: string) {
  return DATA_URI_REGEX.test(url)
}

function removeUnit(item: number | string): string {
  if (typeof item === 'number') return `${item}`
  if (typeof item === 'string') return item.replace(/\D.*/g, '')

  return ''
}

export default defineComponent({
  directives: { imageFadeIn },
  props: {
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: '',
    },
    width: {
      type: [String, Number, Array],
      default: '', // e.g. 100, '100, '100px', [375, 750, 1200, 1600, 1920]
    },
    height: {
      type: [String, Number],
      default: '', // e.g. 200, '200', '200px'
    },
    sizes: {
      type: String,
      default: '95vw', // e.g. '150px', '50vw'
    },
    ratio: {
      type: String,
      default: '', // e.g. '16:9', '1:1'
    },
    // TODO: crop should be compliant with Bunny CDN and Unsplash specification
    crop: {
      type: String,
      default: '', // 'width,height', 'width,height,x,y'
    },
    cropPosition: {
      type: String,
      default: '', // 'center','forget','east','north','south','west','northeast','northwest','southeast','southwest'
    },
  },
  setup() {
    const control = defu(inject(IMAGE_CONTROL, { lazy: true }), { lazy: true })

    return {
      control,
    }
  },
  computed: {
    base(): string {
      return this.src.split('?')[0]
    },
    defaultQuery(): string {
      return this.src.split('?')[1] || ''
    },
    type(): string {
      const { src } = this
      if (isStoripressCDN(src)) return 'storipress'
      if (isUnsplash(src)) return 'unsplash'
      if (isDataUri(src)) return 'data-uri'

      return ''
    },
    computedWidthArray(): string[] {
      const { width = '' as string | number } = this

      if (width) {
        if (typeof width === 'number' && width > 0) {
          return [`${width}`]
        }

        if (typeof width === 'string') {
          if (width.includes(',')) return width.split(',').map((i) => removeUnit(i))

          const withoutUnit = removeUnit(width)
          if (withoutUnit) return [withoutUnit]
        }

        if (Array.isArray(width) && width.length > 0) {
          return width.map((i) => removeUnit(`${i}`))
        }
      }

      return DEFAULT_WIDTH
    },
    computedHeight(): string {
      const { height = '' as string | number } = this

      if (height) {
        if (typeof height === 'number' && height > 0) {
          return `${height}`
        }

        if (typeof height === 'string') {
          if (height.includes(',')) return removeUnit(height.split(',')[0])

          return removeUnit(height)
        }
      }
      return ''
    },
    imgRatio(): string {
      const { width, height, ratio, computedWidthArray = [] as string[], computedHeight = '' as string } = this as any

      if (ratio && `${ratio}`.includes(':')) return `${ratio}`

      const firstWidth = computedWidthArray?.[0] || ''
      if (width && height && firstWidth && computedHeight) {
        return `${firstWidth}:${computedHeight}`
      }

      return ''
    },
    computedRatio(): number | null {
      const { imgRatio } = this
      if (imgRatio === '') {
        return null
      }

      if (imgRatio.includes(':')) {
        const [w, h] = imgRatio.split(':')
        const width = Number.parseInt(w, 10)
        const height = Number.parseInt(h, 10)
        return height / width
      }

      const ratio = Number.parseInt(imgRatio, 10)
      return Number.isNaN(ratio) ? null : ratio
    },
    srcset(): string | undefined {
      const { src, type, computedWidthArray, arrangeUrlQueryStoripress, arrangeUrlQueryUnsplash } = this

      if (!src || !type || type === 'data-uri') return undefined

      const result = computedWidthArray.reduce((acc: string[], w: string) => {
        if (w) {
          switch (type) {
            case 'storipress':
              return [...acc, `${arrangeUrlQueryStoripress(w)} ${w}w`]

            case 'unsplash':
              return [...acc, `${arrangeUrlQueryUnsplash(w)} ${w}w`]

            default:
              return [...acc, `${src} ${w}w`]
          }
        }
        return acc
      }, [])

      return result.join(',')
    },
    style(): object {
      const { width, height, computedRatio, computedWidthArray = [], computedHeight = '' } = this
      const firstWidth = computedWidthArray[0] || ''

      if (computedRatio != null && !height) {
        // TODO: Add a Safari workaround
        return {
          ...(width ? { width: `${firstWidth}px` } : null),
          aspectRatio: `1 / ${computedRatio}`,
        }
      }

      return {
        ...(width ? { width: `${firstWidth}px` } : null),
        ...(height ? { height: `${computedHeight}px` } : null),
      }
    },
  },
  methods: {
    arrangeUrlQueryStoripress(w: string) {
      const { base, defaultQuery, crop, cropPosition, computedHeight, imgRatio } = this as any
      const searchParams = new URLSearchParams(defaultQuery)

      searchParams.set('width', w)
      if (computedHeight) searchParams.set('height', computedHeight)
      else if (imgRatio) searchParams.set('aspect_ratio', imgRatio)

      if (crop) {
        searchParams.set('crop', crop)
        if (cropPosition) searchParams.set('crop_gravity', cropPosition)
      }

      return `${base}?${searchParams.toString()}`
    },
    arrangeUrlQueryUnsplash(w: string) {
      const { base, defaultQuery, cropPosition, computedHeight, imgRatio } = this as any
      const searchParams = new URLSearchParams(defaultQuery)

      searchParams.set('w', w)
      if (computedHeight) searchParams.set('h', computedHeight)
      else if (imgRatio) {
        searchParams.set('ar', imgRatio)
        searchParams.set('fit', 'crop')
      }
      if (cropPosition) searchParams.set('crop', cropPosition)

      return `${base}?${searchParams.toString()}`
    },
  },
})
</script>

<template>
  <img
    v-bind="$attrs"
    class="responsive-image w-full"
    :src="src"
    :srcset="srcset"
    :sizes="sizes"
    :alt="alt"
    :style="style"
    :loading="control.lazy ? 'lazy' : undefined"
  />
</template>
