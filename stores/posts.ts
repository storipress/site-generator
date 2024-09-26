import { defineStore } from 'pinia'

export const usePosts = defineStore({
  id: 'posts',

  state: () => ({ map: {} as Record<string, unknown>, title: null as null | string }),

  actions: {
    SET_POST({ slug, article, format }: { slug: string; article: Record<string, unknown>; format: string }) {
      this.map[slug] = { article, format }
    },

    SET_TITLE(title: string | null) {
      this.title = title
    },
  },
})

export default usePosts
