import { EExportStatus } from '../enums/export-status.enum'

export interface IExportedReport {
    exportStatus: EExportStatus,
    id: string,
    url: string,
    name: string
}
