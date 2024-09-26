import { StyleDocument } from '../graphql-operations'
import { client } from './apollo'

export default () => client.query({ query: StyleDocument })
