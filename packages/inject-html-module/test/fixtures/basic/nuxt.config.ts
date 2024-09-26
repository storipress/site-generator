export default defineNuxtConfig({
  modules: ['../../../src/module'],
  injectHtml: {
    profiles: {
      default: {
        footer: `
      <script>console.log('##default##')</script>
      `,
      },
      front: {
        header: `
      <script>console.log('##front##')</script>
      `,
      },
      article: {
        header: `
      <script>console.log('##article##')</script>
      `,
      },
      complex: {
        header: `
        <script
          type="text/javascript"
          data-cmp-ab="1"
          src="https://cdn.consentmanager.net/delivery/autoblocking/ac7bdf80b1ac2.js"
          data-cmp-host="d.delivery.consentmanager.net"
          data-cmp-cdn="cdn.consentmanager.net"
          data-cmp-codesrc="0"></script>
        `,
      },
    },
  },
})
