export function normalizeSEO({ inject: { header = '', footer = '' } = {}, ...rest }: any = {}) {
  return {
    ...rest,
    inject: {
      header,
      footer,
    },
  }
}
