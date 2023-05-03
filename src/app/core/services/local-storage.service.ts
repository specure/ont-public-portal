import { Injectable, Inject, PLATFORM_ID } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor(
    // tslint:disable-next-line:ban-types
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  setItem(key: string, value: string): boolean {
    if (isPlatformBrowser(this.platformId)) {
      if (!this._supports_html5_storage()) {
        return false
      }
      localStorage.setItem(key, value)
      return true
    }
    return false
  }

  getItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      if (!this._supports_html5_storage()) {
        return null
      }
      return localStorage.getItem(key)
    }
    return null
  }

  removeItem(key: string): boolean {
    if (isPlatformBrowser(this.platformId)) {
      if (!this._supports_html5_storage()) {
        return false
      }
      localStorage.removeItem(key)
      return true
    }
    return false
  }

  private _supports_html5_storage(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      try {
        return (
          window &&
          'localStorage' in window &&
          window.localStorage !== undefined
        )
      } catch (e) {
        console.warn("Current browser doesn't support local storage")
        return false
      }
    }
    return false
  }
}
