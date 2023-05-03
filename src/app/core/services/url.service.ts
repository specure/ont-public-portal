import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

@Injectable({
  providedIn: 'root',
})
export class URLService {
  constructor(private router: Router) {}

  toSearchParams(queryParams: { [key: string]: string | number }): void {
    const searchParams = Object.keys(queryParams)
      .map((k) => `${k}=${encodeURIComponent(queryParams[k])}`)
      .join('&')
    globalThis.history?.replaceState(
      null,
      '',
      `${globalThis.location?.pathname}?${searchParams}`
    )
  }
}
