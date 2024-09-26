import type { Ref } from 'vue'

export const TRANSITION_STATE = Symbol('transition-state')

export const transitionProps = {
  enterFrom: {
    type: String,
    default: '',
  },
  enter: {
    type: String,
    default: '',
  },
  enterTo: {
    type: String,
    default: '',
  },
  leaveFrom: {
    type: String,
    default: '',
  },
  leave: {
    type: String,
    default: '',
  },
  leaveTo: {
    type: String,
    default: '',
  },
}

export function useTransitionState() {
  return inject(TRANSITION_STATE, ref('entered'))
}

interface Props {
  enter: string
  enterTo: string
  leave: string
  leaveTo: string
  enterFrom: string
  leaveFrom: string
}

export function useTransitionClasses(props: Props, state: Ref<string>) {
  return {
    classes: computed(() => {
      switch (state.value) {
        case 'entering':
          return props.enter
        case 'entered':
          return props.enterTo || props.enter
        case 'leaving':
          return props.leave
        case 'leaved':
          return props.leaveTo || props.leave
        case 'enter':
          return props.enterFrom
        case 'leave':
          return props.leaveFrom
      }
    }),
  }
}
