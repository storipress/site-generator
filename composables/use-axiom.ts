import { Axiom } from '@axiomhq/js'

export function useAxiom() {
  const axiom = new Axiom({
    token: 'xaat-ea2bdb03-5596-4c29-a197-9b6acc8974ab',
  })

  return (dataset: string, events: object) => {
    axiom.ingest(dataset, events)
  }
}
