export function useStoripress() {
  const {
    public: { storipressCompat },
  } = useRuntimeConfig()

  return storipressCompat
}
