export const getBrowserName = (): string => {
  if (typeof globalThis.navigator === 'undefined') {
    return 'Unknown'
  }

  const ua = globalThis.navigator.userAgent

  // Chrome
  if (
    ua.indexOf('Chrome') > -1 &&
    ua.indexOf('Chromium') === -1 &&
    ua.indexOf('Edg') === -1
  ) {
    return 'Chrome'
  }

  // Edge
  if (ua.indexOf('Edg') > -1) {
    return 'Edge'
  }

  // Firefox
  if (ua.indexOf('Firefox') > -1) {
    return 'Firefox'
  }

  // Safari
  if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    return 'Safari'
  }

  // Opera
  if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
    return 'Opera'
  }

  // IE
  if (ua.indexOf('Trident') > -1) {
    return 'Internet Explorer'
  }

  return 'Unknown'
}
