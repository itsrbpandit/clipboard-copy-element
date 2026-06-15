function createNode(text: string): Element {
  const node = document.createElement('pre')
  node.style.width = '1px'
  node.style.height = '1px'
  node.style.position = 'fixed'
  node.style.top = '5px'
  node.textContent = text
  return node
}

// Some characters, such as the non-breaking space (U+00A0), render
// identically to a regular space but are copied to the clipboard as their
// original, non-printable code point. This can be abused to hide malicious
// content (for example in shell commands) that is invisible in the rendered
// page. Normalizing these characters ensures the copied text matches what the
// user sees. See https://hackerone.com/reports/1805414
function normalizeText(text: string): string {
  return text.replace(/\u00A0/g, ' ')
}

function copySelection(node: Element): Promise<void> {
  const selection = getSelection()
  if (selection == null) {
    return Promise.reject(new Error())
  }

  selection.removeAllRanges()

  const range = document.createRange()
  range.selectNodeContents(node)
  selection.addRange(range)

  document.execCommand('copy')
  selection.removeAllRanges()
  return Promise.resolve()
}

export function copyNode(node: Element): Promise<void> {
  return copyText(node.textContent || '')
}

export function copyText(text: string): Promise<void> {
  const normalized = normalizeText(text)

  if ('clipboard' in navigator) {
    return navigator.clipboard.writeText(normalized)
  }

  const body = document.body
  if (!body) {
    return Promise.reject(new Error())
  }

  const node = createNode(normalized)
  body.appendChild(node)
  copySelection(node)
  body.removeChild(node)
  return Promise.resolve()
}
