import { $, argv, fs, path } from 'zx'
import { ZodError, z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { createCommonJS } from 'mlly'
import { P, isMatching } from 'ts-pattern'
import { generateEnv, resolvePublicationOpts } from './helper'

const { __dirname } = createCommonJS(import.meta.url)

enum Publication {
  EOTC = 'eotc',
  MissingPerspectives = 'mp',
  GenZine = 'gen-zine',
  Joes = 'joes',
}

const clientIDMap = {
  [Publication.EOTC]: 'P2V6KCUZX',
  [Publication.MissingPerspectives]: 'PSX035VBS',
  [Publication.GenZine]: 'PGBWUFTI3',
  [Publication.Joes]: 'D6RX98VXN',
}

const argvSchema = z.object({
  _: z.tuple([
    z
      .string()
      .refine((publication) => {
        return (
          Object.values(Publication).includes(publication as Publication) ||
          isMatching(
            P.string
              .maxLength(9)
              .minLength(9)
              .regex(/^P|S|D/),
            publication,
          )
        )
      })
      .transform((publication) => {
        if (Object.values(Publication).includes(publication as Publication)) {
          return clientIDMap[publication as Publication]
        }
        return publication
      }),
  ]),
})

async function main() {
  const opt = argvSchema.parse(argv)
  const info = await resolvePublicationOpts(opt._[0])
  console.log(info)
  const envContent = generateEnv({ ...info, encryptKey: await readEncryptKey() })
  await fs.writeFile(path.resolve(__dirname, '../.env'), envContent)
  await fs.writeFile(path.resolve(__dirname, '../playground/.env'), envContent)
  await fs.remove(path.resolve(__dirname, '../playground/.nuxt/cache'))
  await fs.remove(path.resolve(__dirname, '../playground/generated'))
  await $`yarn generate-templates`
  console.log('done')
}

// base64 encoded 32 byte key
async function readEncryptKey() {
  const { key } = await fs.readJSON(path.resolve(__dirname, '../cli/encrypt-key.json'))
  return key
}

main().catch((error) => {
  if (error instanceof ZodError) {
    console.error(fromZodError(error))
  } else {
    console.error(error)
  }
})
