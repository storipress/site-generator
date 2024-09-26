import getGeneratorData from '../../../api/get-generator-data'
import { getFrontData } from '~/utils/extract-routes'

export default defineCachedEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/json')
  const { data: generatorData } = await getGeneratorData()
  // const articles = await getArticlesData()
  const frontData = getFrontData(generatorData)
  return frontData
})
