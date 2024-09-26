import type { Simplify } from 'type-fest'
import { createContext } from 'unctx'
import _getGeneratorData from '../../api/get-generator-data'
import _getStyleData from '../../api/get-style-data'
import _getRedirection from '../../api/get-redirections-data'
import type { GeneratorDataQuery, StyleQuery } from '../../graphql-operations'
import { mockGeneratorData, mockStyleData } from './mock-data'

type PickDataPromise<T extends (...args: any[]) => Promise<{ data: any }>> = Promise<
  Simplify<Pick<Awaited<ReturnType<T>>, 'data'>>
>

export interface Config {
  useMock: boolean
}

const config = createContext<Config>()

function useConfig(): Config {
  return config.tryUse() ?? { useMock: false }
}

export function setConfig(conf: Config) {
  config.set(conf, true)
}

export async function getGeneratorData(): PickDataPromise<typeof _getGeneratorData> {
  const { useMock } = useConfig()
  if (useMock) {
    return { data: mockGeneratorData as unknown as GeneratorDataQuery }
  }
  return await _getGeneratorData()
}

export async function getStyleData(): PickDataPromise<typeof _getStyleData> {
  const { useMock } = useConfig()
  if (useMock) {
    return { data: mockStyleData as unknown as StyleQuery }
  }
  return await _getStyleData()
}

export async function getRedirections(): PickDataPromise<typeof _getRedirection> {
  const { useMock } = useConfig()
  if (useMock) {
    return { data: { redirections: [] } }
  }
  return await _getRedirection()
}
