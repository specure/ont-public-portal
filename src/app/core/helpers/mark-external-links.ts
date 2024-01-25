import { timer } from 'rxjs'

export function markExternalLinks() {
  timer(0).subscribe(() => {
    const links: NodeListOf<HTMLAnchorElement> =
      globalThis.document?.querySelectorAll('a:not(.nt-link--external)')
    links?.forEach((l) => {
      if (
        l &&
        l.href &&
        !l.href.includes(globalThis.location?.host) &&
        !l.href.includes('javascript') &&
        !l.querySelector('img') &&
        !l.classList.contains('maplibregl-ctrl-logo')
      ) {
        l.classList.add('nt-link--external')
        l.target = '_blank'
      }
    })
  })
}
