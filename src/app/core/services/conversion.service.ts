import { Injectable } from '@angular/core'

const MOBILE_THRESHOLDS = {
  LTE: { low: 95, high: 111 },
  WLAN: { low: 61, high: 76 },
  GSM: { low: 85, high: 101 }
}

@Injectable({ providedIn: 'root' })
export class ConversionService {
  constructor() { }

  getSignalQuality(technology: string, signal: number) {
    if (!technology || !signal) {
      return 'empty'
    }
    const { low, high } = MOBILE_THRESHOLDS[technology] || MOBILE_THRESHOLDS.GSM

    const signalQualityChecks = [
      { quality: 'good', check: signal <= low },
      { quality: 'medium', check: signal > low && signal <= high },
      { quality: 'bad', check: signal > high }
    ]

    return signalQualityChecks.find(({ check }) => check).quality
  }
}
