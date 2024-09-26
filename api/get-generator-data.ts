import { GeneratorDataDocument } from '../graphql-operations'
import { client } from './apollo'

export default () => client.query({ query: GeneratorDataDocument })
