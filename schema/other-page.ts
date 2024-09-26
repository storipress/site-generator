import * as z from 'zod'

export const TemplateDataSchema = z.object({
  title: z.string(),
  caption: z.string().nullish(),
  description: z.string().nullish(),
  headlineAlt: z.string().nullish(),
  headlineURL: z.string().nullish(),
})
export type TemplateData = z.infer<typeof TemplateDataSchema>

export const ElementsSchema = z.object({
  dropcap: z.string(),
  blockquote: z.string(),
})
export type Elements = z.infer<typeof ElementsSchema>

export const RawOtherPageDataSchema = z.object({
  elements: ElementsSchema,
  template: z.string(),
  templateData: TemplateDataSchema,
  editorContent: z.any(),
  styles: z.any(),
})
export type RawOtherPageData = z.infer<typeof RawOtherPageDataSchema>

export const NormalSegmentSchema = z.object({
  id: z.literal('normal'),
  type: z.string(),
  html: z.string(),
})

export type NormalSegment = z.infer<typeof NormalSegmentSchema>

export const AdSegmentSchema = z.object({
  id: z.string(),
  type: z.literal('ad'),
  props: z.record(z.any()),
})

export type AdSegment = z.infer<typeof AdSegmentSchema>

export const PaidSegmentSchema = z.object({
  id: z.literal('paid'),
  type: z.string(),
  paidContent: z.string(),
})

export type PaidSegment = z.infer<typeof PaidSegmentSchema>

export const SegmentSchema = z.union([NormalSegmentSchema, AdSegmentSchema, PaidSegmentSchema])

export type Segment = z.infer<typeof SegmentSchema>

export const CoverSchema = z.object({
  url: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
})

export const LayoutSchema = z.object({
  id: z.string(),
  template: z.string(),
})

export type Layout = z.infer<typeof LayoutSchema>

export const OtherPageSchema = z.object({
  title: z.string(),
  pageTitle: z.string(),
  seo: z.any(),
  cover: CoverSchema,
  layout: LayoutSchema,
  html: z.string(),
  segments: z.array(SegmentSchema),
})

export type OtherPage = z.infer<typeof OtherPageSchema>
