<script lang="ts">
import type { PropType } from 'vue'
import LinkElement from '../common/link-element.vue'
import TextElement from './text-element.vue'

interface Author {
  name: string
  url: string
}

export default defineComponent({
  components: { LinkElement, TextElement },

  props: {
    kind: {
      type: String,
      required: true,
    },
    blockType: {
      type: String,
    },
    component: {
      type: String,
      default: 'p',
    },
    authorComponent: {
      type: String,
      default: 'span',
    },
    authors: {
      type: Array as PropType<Author[]>,
      required: true,
      default: () => [],
    },
    separator: {
      type: String,
      default: ', ',
    },
    authorClass: {
      type: String,
    },
    separatorClass: {
      type: String,
    },
    preposition: {
      type: String,
      default: '',
    },
  },

  computed: {
    textProps() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { component, authorComponent, authors, authorClass, separator, separatorClass, ...rest } = this.$props
      return {
        component: authorComponent,
        ...rest,
      }
    },
  },
})
</script>

<template>
  <component :is="component" v-if="authors?.length > 0" :class="kind">
    {{ preposition }}
    <template v-for="(author, i) of authors" :key="i">
      <slot name="separator" :index="i" :author="author" class="inherit">
        <template v-if="i === 0" /><span v-else-if="i === authors.length - 1" class="inherit" :class="separatorClass">
          and </span
        ><span v-else class="inherit" :class="separatorClass">{{ separator }}</span>
      </slot>
      <LinkElement :href="author.url" class="inherit" :class="authorClass">
        <slot name="author" :author="author" :index="i">
          <TextElement class="inherit inline" v-bind="textProps">
            {{ author.name }}
          </TextElement>
        </slot>
      </LinkElement>
    </template>
  </component>
</template>

<style scoped>
.inherit {
  font-size: inherit;
  font-family: inherit;
  font-weight: inherit;
  font-style: inherit;
  text-decoration: inherit;
  text-transform: inherit;
  text-align: inherit;
  color: inherit;
  line-height: inherit;
}
</style>
