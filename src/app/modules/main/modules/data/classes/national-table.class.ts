import { extend } from 'src/app/core/helpers/extend'
import { INationalTable } from '../interfaces/national-table.interface'
import { IProviderStats } from '../interfaces/provider-stats.interface'

export class NationalTable implements INationalTable {
  allMeasurements: number
  averageDownload: number
  averageLatency: number
  averageUpload: number
  statsByProvider: IProviderStats[]

  static from(other: INationalTable) {
    const patchedEntries = Object.entries(other).reduce((acc, [key, val]) => {
      if (
        ['averageDownload', 'averageLatency', 'averageUpload'].includes(key)
      ) {
        return { ...acc, [key]: val === 'Infinity' ? 0 : val }
      }
      return acc
    }, {})
    const statsByProvider = other.statsByProvider.map((stats) => {
      const retVal = { ...stats }
      for (const key of ['download', 'upload', 'latency']) {
        if (retVal[key] === 'Infinity') {
          retVal[key] = 0
        }
      }
      return retVal
    })
    return extend<NationalTable>(new NationalTable(), {
      ...other,
      ...patchedEntries,
      statsByProvider,
    })
  }
}
