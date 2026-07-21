// Escape user-editable content before it goes into innerHTML.
export function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Escape text, then turn [label](url) markdown links into anchors.
// Only http(s) URLs are linkified; everything else stays escaped text.
export function mdLinks(s = '') {
  return esc(s).replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    (_, label, url) =>
      `<a href="${url}" target="_blank" rel="noopener">${label}</a>`,
  )
}

// Escape text, then turn __text__ into bold text.
export function mdBold(s = '') {
  return esc(s).replace(/__([^_]+)__/g, '<strong>$1</strong>')
}

// "Home Server!" -> "home-server", for card detail-page URLs.
export function slugify(s = '') {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
