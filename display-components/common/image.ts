import type { InjectionKey } from 'vue'

interface ImageControl {
  lazy: boolean
}

export const IMAGE_CONTROL: InjectionKey<ImageControl> = Symbol('image-control')
