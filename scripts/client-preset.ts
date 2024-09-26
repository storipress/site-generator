export interface ClientInfo {
  clientID: string
  name: string
  token: string
  searchKey: string
  domain: string
}

export const clientPreset: Record<string, Omit<ClientInfo, 'clientID'>> = {
  // empty test instance
  D0DYBYS2T: {
    name: 'Empty test',
    token: 'spt_g84r0fQUMYdp1dh8mQATULCn420c1F9DoR6f48RSUP',
    searchKey:
      'S0NpejZVNWtJWitHbjNvb0VDblVZTTFlaHNwMklQa25LUFBuZitPMG9LUT00ZGRNeyJjb2xsZWN0aW9uIjoiRDBEWUJZUzJULWFydGljbGVzIiwiZmlsdGVyX2J5IjoicHVibGlzaGVkOj10cnVlIiwiZXhwaXJlc19hdCI6MTg0NzE1ODY2NH0=',
    domain: 'www.example.com',
  },

  // no member instance
  D87ILQJZV: {
    name: 'No member',
    token: 'spt_Gmrj2aEhnmLbQsYZN5zxabIUezbuEgg2BFdX3tFWMR',
    searchKey:
      'aXQ3cnY5dDE1Z3NVZ2ZyV3JiaGorcm1UbGtJWHU3WGhUMmVwTHJRT2x2QT00ZGRNeyJjb2xsZWN0aW9uIjoiRDg3SUxRSlpWLWFydGljbGVzIiwiZmlsdGVyX2J5IjoicHVibGlzaGVkOj10cnVlIiwiZXhwaXJlc19hdCI6MTg0NzI4NTcyNX0=',
    domain: 'www.example.com',
  },

  // paid member test instance
  DCTKABD9C: {
    name: 'Paid member',
    token: 'spt_NSw0Rgp0NyMDMrVWvOcLbeZGhJ4vPdTPmpmq3QsF1c',
    searchKey:
      'K0NOaUlSMTVqVG4wSDRMTHhrSXBpUFA0UVhXMVM2VTU3M3JqNUJFSHJuaz00ZGRNeyJjb2xsZWN0aW9uIjoiRENUS0FCRDlDLWFydGljbGVzIiwiZmlsdGVyX2J5IjoicHVibGlzaGVkOj10cnVlIiwiZXhwaXJlc19hdCI6MTg0NzI4NjY4N30=',
    domain: 'paid-subscription-publication-y1vp-cdn.storipress.dev',
  },

  // MP
  PSX035VBS: {
    name: 'MP',
    token: 'spt_BDduYAZgu4hd6HMhw3xBXLkihgHsLtu5V9OI2waift',
    searchKey:
      'M2xGOGk5QXgyRG9zRDJHN05DYmhFQ2FFbE5NZW5IcFVHSGx1NVBBMHgvZz1mZ2EzeyJjb2xsZWN0aW9uIjoiUFNYMDM1VkJTLWFydGljbGVzIiwiZmlsdGVyX2J5IjoicHVibGlzaGVkOj10cnVlIiwiZXhwaXJlc19hdCI6MTg0NjIyNTQzNX0=',
    domain: 'www.missingperspectives.com',
  },

  // Milan
  PRX222MGD: {
    name: 'Milan',
    token: 'spt_s7tBU0aPIgTj0vjL00qUy6vmoCSE3i2f4KAc17Py1y',
    searchKey:
      'TGFIWFV3R29ucEV4WktVYWtSU1hWMFhpdHVFUjRFZFdrVGN6ZGhJSE5SRT1mZ2EzeyJjb2xsZWN0aW9uIjoiUFJYMjIyTUdELWFydGljbGVzIiwiZmlsdGVyX2J5IjoicHVibGlzaGVkOj10cnVlIiwiZXhwaXJlc19hdCI6MTg0NjY4OTcyN30=',
    domain: 'milanosportiva.com',
  },

  // gen-zine
  PGBWUFTI3: {
    name: 'gen-zine',
    token: 'spt_SmN4ljnlSk5m4SdAtc9FZdLOv9LLrnaz3DIE2GXnMI',
    searchKey:
      'LzcxTDlaNjJzeEYreG01TTZrZVFOQ1hicFBPcGwyeTZEOGZtK1JQdTRaYz1mZ2EzeyJjb2xsZWN0aW9uIjoiUEdCV1VGVEkzLWFydGljbGVzIiwiZmlsdGVyX2J5IjoicHVibGlzaGVkOj10cnVlIiwiZXhwaXJlc19hdCI6MTg0NjY5MDA3NH0=',
    domain: 'gen-zine.xyz',
  },

  // EOTC
  P2V6KCUZX: {
    name: 'EOTC',
    token: 'spt_UzDU5hDjdbpSeMnnEifu8rnmpOViXs556kOR4UFZxV',
    searchKey:
      'SDNwcm9Ud3BCMmdjdjB6L1phSCtlM3lYZlh5RUQ4MWdMTTZqdWpmdDI5TT1mZ2EzeyJjb2xsZWN0aW9uIjoiUDJWNktDVVpYLWFydGljbGVzIiwiZmlsdGVyX2J5IjoicHVibGlzaGVkOj10cnVlIiwiZXhwaXJlc19hdCI6MTg0Mjc2NDc5Nn0=',
    domain: 'edgeofthecrowd.com',
  },
}
