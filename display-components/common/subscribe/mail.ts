import fetch from 'cross-fetch'
import { identity } from 'lodash'

import { loadJsonp } from './jsonp'

export interface MailResult {
  result: string
  msg: string
  raw: unknown
}

export interface Mail {
  action: string
  strategy: 'form' | 'jsonp' | 'ajax'
  provider: string | null
  fieldName: string
}

export interface RewriteResult {
  url: string
  search: Record<string, string>
}

export const REWRITER: Record<string, (url: URL) => RewriteResult> = {
  mailchimp: (url: URL) => {
    return {
      url: `${url.origin}${url.pathname.replace(/post$/, 'post-json')}`,
      search: Object.fromEntries(url.searchParams.entries()),
    }
  },
}

export function defaultRewriter(url: URL): RewriteResult {
  return { url: url.toString(), search: {} }
}

export function rewriteURL(url: URL, provider: string | null): RewriteResult {
  if (!provider) {
    return defaultRewriter(url)
  }
  const rewriter = REWRITER[provider] || defaultRewriter
  return rewriter(url)
}

const EXTRACT_RESULT: Record<string, (raw: any) => Pick<MailResult, 'msg' | 'result'>> = {
  convertkit: (raw: any) => {
    return {
      result: raw.status,
      msg: '',
    }
  },
}

export function extractResult(raw: any, provider: string | null): MailResult {
  if (!provider) {
    return {
      result: 'success',
      msg: '',
      raw,
    }
  }
  const extractor = EXTRACT_RESULT[provider] || identity
  return { ...extractor(raw), raw }
}

interface ExecuteSubscribe {
  url: string
  params: Record<string, string>
  strategy: 'ajax' | 'jsonp'
  provider: string | null
}

async function ajaxExecuteSubscribe({ url, params }: Pick<ExecuteSubscribe, 'url' | 'params'>): Promise<unknown> {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
  return await res.json()
}

function jsonpExecuteSubscribe({ url, params }: Pick<ExecuteSubscribe, 'url' | 'params'>): Promise<unknown> {
  return loadJsonp({ url, params, callbackKey: 'c' })
}

export async function executeSubscribe({ url, params, strategy, provider }: ExecuteSubscribe): Promise<MailResult> {
  const executor = strategy === 'ajax' ? ajaxExecuteSubscribe : jsonpExecuteSubscribe
  const raw = await executor({
    url,
    params,
  })
  return extractResult(raw, provider)
}
