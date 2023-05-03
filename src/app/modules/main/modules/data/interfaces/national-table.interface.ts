import { IProviderStats } from './provider-stats.interface'

export interface INationalTable {
    allMeasurements: number
    averageDownload: number | string
    averageLatency: number | string
    averageUpload: number | string
    statsByProvider: IProviderStats[]
}
