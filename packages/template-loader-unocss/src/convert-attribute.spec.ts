import { expect, it } from 'vitest'
import { convertAttributeStringToStyle, normalizeAttribute } from './convert-attribute'

it.each([
  ['fontSize', '12', 'text-[12px]'],
  [':fontSize', '{xs: 12, md: 14, lg: 16}', 'text-[12px] md:text-[14px] lg:text-[16px]'],
  ['color', 'ff0000', 'text-[#ff0000]'],
  ['hoverColor', '00ff00', 'hover:text-[#00ff00]'],
  ['fontFamily', 'Ibarra Real Nova', 'ff-[Ibarra_Real_Nova]'],
  ['bold', 'true', 'font-bold'],
  ['underline', 'false', ''],
  ['width', '10', 'w-[10px]'],
  ['width', '100%', 'w-[100%]'],
  ['width', 'calc(100% - 1.5rem)', 'w-[calc(100%_-_1.5rem)]'],
  ['max', '10', 'max-w-[10px]'],
  [':underline', 'false', ''],
  ['uppercase', 'true', 'uppercase'],
  ['lowercase', 'true', 'lowercase'],
  ['unknown', 'true', null],
])('convert-attribute %s="%s" => %s', (key, value, expected) => {
  expect(convertAttributeStringToStyle(key, value)).toBe(expected)
})

it.each([
  ['fontSize', '12', ['fontSize', { xs: '12' }]],
  [':fontSize', '{xs: 12, md: 14, lg: 16}', ['fontSize', { xs: 12, md: 14, lg: 16 }]],
  ['color', 'ff0000', ['color', { xs: 'ff0000' }]],
  ['hoverColor', '00ff00', ['hoverColor', { xs: '00ff00' }]],
  ['bold', 'true', ['bold', { xs: true }]],
  ['underline', 'false', ['underline', { xs: false }]],
  ['max', '10', ['max', { xs: '10' }]],
  [':underline', 'false', ['underline', { xs: false }]],
  ['unknown', 'true', null],
  ['font-size', '12', ['fontSize', { xs: '12' }]],
  [':font-size', '{xs: 12, md: 14, lg: 16}', ['fontSize', { xs: 12, md: 14, lg: 16 }]],
])('normalize-attribute %s="%s" => %s', (key, value, expected) => {
  expect(normalizeAttribute(key, value)).toEqual(expected)
})
