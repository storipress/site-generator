import { argv, fs, path } from 'zx'
import invariant from 'tiny-invariant'
import { createCommonJS } from 'mlly'
import { createClient } from '../api/apollo'
import { StyleDocument } from '../graphql-operations'
import { getAPIHost, resolvePublicationOpts } from './helper'

const { __dirname } = createCommonJS(import.meta.url)

const clientId = argv._[0]
const clientInfo = await resolvePublicationOpts(clientId)
const client = createClient({
  apiHost: getAPIHost(clientInfo.clientID),
  clientID: clientInfo.clientID,
  apiToken: clientInfo.token,
})

invariant(clientId, 'missing client id')
await fs.mkdirs(path.resolve(__dirname, 'design'))

const { data } = await client.query({
  query: StyleDocument,
})

await fs.writeFile(path.resolve(__dirname, 'design', 'dump.json'), JSON.stringify(data, null, 2))
