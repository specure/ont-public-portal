import { ESpeedUnits } from 'src/app/core/enums/speed-units.enum'
import { EThresholdUnits } from 'src/app/core/enums/threshold-units.enum'

const MULTIPLIER = 1000
const DIVIDER = 0.001
type convert = (unit: ESpeedUnits | EThresholdUnits) => number

export function convertBytes(value: number): { from: convert, to: convert } {
  return {
    from: unit => transformValue(value, unit, MULTIPLIER),
    to: unit => transformValue(value, unit, DIVIDER),
  }
}

const transformValue = (value: number, unit: ESpeedUnits | EThresholdUnits, multiplier: number): number => {
  const unitChecks = [
    { check: unit === ESpeedUnits.GBPS || unit === EThresholdUnits.GB, result: value * multiplier * multiplier },
    { check: unit === ESpeedUnits.MBPS || unit === EThresholdUnits.MB, result: value * multiplier },
    { check: unit === ESpeedUnits.KBPS || unit === EThresholdUnits.KB, result: Math.floor(value) },
  ]

  const { result } = unitChecks.find(({ check }) => check)
  const resultNum = Math.round(result)
  let rounder = 1
  if (resultNum < 1) {
    rounder = 1000
  } else if (resultNum < 10) {
    rounder = 100
  } else if (resultNum < 100) {
    rounder = 10
  }
  return Math.round(result * rounder) / rounder
}
