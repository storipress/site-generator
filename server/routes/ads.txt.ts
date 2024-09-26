import getGeneratorData from '~/../api/get-generator-data'
import { extractIntegrations } from '~~/../modules/integrations/integrations'

export default defineCachedEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'text/plain')
  const { data: generatorData } = await getGeneratorData()
  const { adsense } = extractIntegrations({ integrations: generatorData.integrations })

  return adsense.adsTxt || ''
})
