import { useStoripressCompatInject } from './storipress-compat-inject'

export function useLogo() {
  const { logo } = useStoripressCompatInject()
  return logo
}
