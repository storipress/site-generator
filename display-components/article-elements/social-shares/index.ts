interface GenerateLinksInput {
  url: string
  title: string
  siteName: string
}

export function generateLinks({ url, title, siteName }: GenerateLinksInput) {
  return {
    facebook: generateFacebook(url),
    twitter: generateTwitter(url, title),
    linkedin: generateLinkedin(url, title),
    email: generateEmail(url, title, siteName),
  }
}

export function generateFacebook(url: string) {
  return `https://www.facebook.com/sharer.php?u=${encodeURIComponent(url)}`
}

export function generateTwitter(url: string, title: string) {
  return `https://twitter.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
}

export function generateLinkedin(url: string, title: string) {
  return `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
}

export function generateEmail(url: string, title: string, siteName: string) {
  const body = `Thought I'd share this article with you from ${siteName}
[${title}](${url})
You'd enjoy it!`
  return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`
}
