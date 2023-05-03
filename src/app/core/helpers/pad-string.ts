export function padLeft(source: string, pad = '00') {
  return `${pad.substring(0, pad.length - source.length)}${source}`
}

export function padRight(source: string, pad = '00') {
  return `${source}${pad.substring(0, pad.length - source.length)}`
}